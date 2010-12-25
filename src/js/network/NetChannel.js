/**
File:
	NetChannel
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	-> client talks to this object
	<--> this object waits to be ready, when it is
 	  <-- this object talks to the server
 	   <--> server does some stuff
	     --> the server talks to this object
		  --> this object talks to the client --^

Basic Usage:

 */
define(['network/Message', 'network/ServerGameSelector', 'lib/bison'], function(Message, ServerGameSelector, BISON) {
	/**
	 * NetChannel facilitates communication between the client-game, and the server-game
	 * @param config  		A game configuration
	 * @param aController 	The delegate for this NetChannel. One NetChannel per game.
	 */
	function NetChannel( config, aController )
	{
		var that = this;
		this.controller = aController;	// For callbacks once messages are validated
		this.config = config;

		// Dev flag, turning this on will output tons information to the console
		this.verboseMode = false;

		// Make sure this controller is valid before moving forward, the controller must contain certain methods we can rely on being callable
		if( this.validateController(aController) === false)
		{
			console.log("(NetChannel) Controller " + aController + " is undefined or does not conform to the valid methods. Ignored.");
			return;
		}

		// connection info
		this.frameLatency = 0; 	// lag over time
		this.latency = 1000; // lag right now

		// Timings
		this.gameClock = -1;
		this.lastSentTime = -1;
		this.lastRecievedTime = -1; // Last time we received a message

		// When we  can send another message to prevent flooding - determined by 'rate' variable
		this.clearTime = -1; // if realtime > cleartime, free to go
		this.cmdrate = this.config.CLIENT_SETTING.cmdrate;	// (SEND) messages/sec

		// array of the last 31 messages sent
		this.messageBuffer = [];
		this.MESSAGE_BUFFER_MASK = 15; // This is used in the messageBuffer bitmask - It's the sequence number

		this.incomingSequenceNumber = 0;
		this.incommingCmdBuffer = [];

		// We will send these out as controlled by the config
		this.outgoingSequenceNumber = 0;

		this.outgoingCmdBuffer = new SortedLookupTable();

		// We send this, and we wait for the server to send back matching seq.number before we empty this.
		// When this is empty, then we can send whatever the next one is
		this.reliableBuffer = null;  // store last sent message here

		/**
		 * WebSocket connection
		 */
		this.clientID = -1;


		// get a response from the Server and figure out which port we really need to connect to.
		new ServerGameSelector(config, function( newPort, connected ) {
			that.onSeverGameSelectorResponse( newPort, connected );
		});

		console.log('(NetChannel)::Initialize')
	}

	NetChannel.prototype.onSeverGameSelectorResponse = function( newPort, connected ) {
		if( connected )
		{
			console.log("(NetChannel) Connecting to ws://" + this.config.HOST + ':' + this.config.SERVER_SETTING.GAME_PORT);

			this.connection = new WebSocket( 'ws://' + this.config.HOST + ':' + newPort );
			this.connection.onopen = function() { that.onConnectionOpened(); };
			this.connection.onmessage = function(messageEvent) { that.onServerMessage(messageEvent); };
			this.connection.onclose = function() { that.onConnectionClosed(); };

			console.log("(NetChannel) Created with socket: ", this.connection);
		} else {
			this.onConnectionClosed();
		}
		var that = this;
		this.newPort = newPort;
	};

	/**
	* Check if a controller conforms to our required methods
	* Later on we can add new things here to make sure this controller is valid to make cheating at least slightly more  difficult
	*/
	NetChannel.prototype.validateController = function(aController)
	{
		var isValid = false; // Assume false

		if(aController &&  aController.netChannelDidConnect && aController.netChannelDidReceiveMessage && aController.netChannelDidDisconnect) {
			isValid = true;
		}

		return isValid;
	};

	NetChannel.prototype.tick = function(gameClockTime)
	{
		this.gameClock = gameClockTime;

		if(this.reliableBuffer !== null) return; // Can't send new message, still waiting

		var hasReliableMessages = false;
		var firstUnreliableMessageFound = null;

		var len = this.messageBuffer.length;
		var i = 0;
		for (var aMessageIndex in this.messageBuffer)
		{
			var message = this.messageBuffer[aMessageIndex];
			if(message.isReliable) // We have more important things to tend to sir.
			{
				hasReliableMessages = true;
				this.sendMessage(message);
				break;
			}
		}

		// No reliable messages waiting, enough time has passed to send an update
		if(!hasReliableMessages && this.canSend() && this.nextUnreliable != null)
		{
			this.sendMessage( this.nextUnreliable )
		}
	};

	/**
	 * Messages from the FROM / SERVER
	 **/
	NetChannel.prototype.onConnectionOpened = function ()
	{
		if( this.verboseMode ) console.log("(NetChannel) onConnectionOpened");

		// Create a new message with the SERVER_CONNECT command
		this.addMessageToQueue(true, this.composeCommand(this.config.CMDS.SERVER_CONNECT, null) );
	};

	/**
	 * A message has been received from the server
	 * @param messageEvent
	 */
	NetChannel.prototype.onServerMessage = function (messageEvent)
	{
		var serverMessage = BISON.decode(messageEvent.data);
		if( this.verboseMode ) console.log("(NetChannel) onServerMessage", messageEvent);

		// Catch garbage
		if(serverMessage === undefined || messageEvent.data === undefined || serverMessage.seq === undefined) return;

		this.lastReceivedTime = this.gameClock;
		this.adjustRate(serverMessage);

		// This is a special command after connecting and the server OK-ing us - it's the first real message we receive
		// So we have to put it here, because otherwise e don't actually have a true client ID yet so the code below will not work
		if(serverMessage.cmds.cmd == this.config.CMDS.SERVER_CONNECT) {
			this.onServerDidAcceptConnection(serverMessage);
		}


		// We sent this, clear our reliable buffer que
		if(serverMessage.id == this.clientID && serverMessage.cmds.cmd != this.config.CMDS.FULL_UPDATE)
		{
			var messageIndex =  serverMessage.seq & this.MESSAGE_BUFFER_MASK;
			var message = this.messageBuffer[messageIndex];

			// Free up reliable buffer to allow for new message to be sent
			if(this.reliableBuffer === message) {
				this.reliableBuffer = null;
			}

			// Remove from memory
			delete this.messageBuffer[messageIndex];
			delete message;
		}
		else if (serverMessage.cmds.cmd == this.config.CMDS.FULL_UPDATE) // World update!
		{
			var len = serverMessage.data.length;
			var i = -1;

			// Store all world updates contained in the message.
			while(++i < len) // Want to parse through them in correct order, so no fancy --len
			{
				var singleWorldUpdate = serverMessage.data[i];
				var worldEntityDescription = this.createWorldEntityDescriptionFromString(singleWorldUpdate);

				// Add it to the incommingCmdBuffer and drop oldest element
				this.incommingCmdBuffer.push(worldEntityDescription);
				if(this.incommingCmdBuffer.length > this.MESSAGE_BUFFER_MASK)
					this.incommingCmdBuffer.shift();
			}
		}
		else // Server wants to tell the gameclient something, not just a regular world update
		{
			this.controller.netChannelDidReceiveMessage(serverMessage);
		}

		delete serverMessage;
	};

	/**
	 * Takes a WorldUpdateMessage that contains the information about all the elements inside of a string
	 * and creates SortedLookupTable out of it with the objectID's as the keys
	 * @param aWorldUpdateMessage
	 */
	NetChannel.prototype.createWorldEntityDescriptionFromString = function(aWorldUpdateMessage)
	{
		// Create a new WorldEntityDescription and store the clock and gametick in it
		var worldDescription = new SortedLookupTable();
		worldDescription.gameTick = aWorldUpdateMessage.gameTick;
		worldDescription.gameClock = aWorldUpdateMessage.gameClock;


		var allEntities = aWorldUpdateMessage.entities.split('|'),
		  	allEntitiesLen = allEntities.length; //

		// Loop through each entity
		while(--allEntitiesLen)   // allEntities[0] is garbge, so by using prefix we avoid it
		{
			// Loop through the string representing the entities properties
			var entityDescAsArray = allEntities[allEntitiesLen].split(','),
				entityDescription = {};

			// GUARANTEED TO BE IN ORDER.
			// SEE GameEntity.js::constructEntityDescription
			// Using the unary operator to convert string to number as it is the fastest.
			entityDescription.objectID = +entityDescAsArray[0];
			entityDescription.clientID = +entityDescAsArray[1];
			entityDescription.entityType = +entityDescAsArray[2]; // convert to int
			entityDescription.theme = +entityDescAsArray[3];
			entityDescription.themeMask = +entityDescAsArray[4];
			entityDescription.x = +entityDescAsArray[5];
			entityDescription.y = +entityDescAsArray[6];
			entityDescription.rotation = +entityDescAsArray[7];

			// If we were sent a score, or a nickname use them
			// If we receive a nickname, it ALWAYS comes after a score
			if(entityDescAsArray[8]) entityDescription.score = +entityDescAsArray[8];
			if(entityDescAsArray[9]) entityDescription.nickname = entityDescAsArray[9];

			// Store the final result using the objectID
			worldDescription.setObjectForKey(entityDescription, entityDescription.objectID);
		}


		return worldDescription;
	};

	NetChannel.prototype.onConnectionClosed = function (serverMessage)
	{
		console.log('(NetChannel) onConnectionClosed', serverMessage);
		this.controller.netChannelDidDisconnect();
	};

	/**
	 * A WS connection hand-shake has occurred. We still do not have a clientID.
	 * Once we receive our first message from the server, it will contain our clientID
	 * @param serverMessage	A message from the server containing our new clientID
	 */
	NetChannel.prototype.onServerDidAcceptConnection = function(serverMessage)
	{
		if( this.verboseMode ) console.log("(NetChannel) onServerDidAcceptConnection", serverMessage);

		// Only the server can create client ID's - grab the one i returned for us;
		this.clientID = serverMessage.id;
		console.log('(NetChannel) Setting clientID to', this.clientID, serverMessage);

		this.controller.netChannelDidConnect(serverMessage);
	};

	/**
	* Sending Messages
	*/
	NetChannel.prototype.addMessageToQueue = function( isReliable, anUnencodedMessage )
	{
		this.outgoingSequenceNumber += 1;
		var message = new Message( this.outgoingSequenceNumber, isReliable, anUnencodedMessage );
		message.clientID = this.clientID;

		// Add to array the queue
		this.messageBuffer[ this.outgoingSequenceNumber & this.MESSAGE_BUFFER_MASK ] = message;

		if(isReliable) {
			this.messageBuffer[ this.outgoingSequenceNumber & this.MESSAGE_BUFFER_MASK ] = message;
		} else {
			this.nextUnreliable = message;
		}

		if( this.verboseMode ) console.log('(NetChannel) Adding Message to que', this.messageBuffer[this.outgoingSequenceNumber & this.MESSAGE_BUFFER_MASK], " ReliableBuffer currently contains: ", this.reliableBuffer);
	};


	NetChannel.prototype.sendMessage = function(aMessageInstance)
	{
		if(this.connection == undefined) {
			console.log("connection is undefined!");
			return;

		}

		if(this.connection.readyState == WebSocket.CLOSED) {
			return;      //some error here
		}
		aMessageInstance.messageTime = this.gameClock; // Store to determine latency

		this.lastSentTime = this.gameClock;

		if( aMessageInstance.isReliable ) {
			this.reliableBuffer = aMessageInstance; // Block new connections
		}

		this.connection.send( aMessageInstance.encodedSelf() );
		if(this.verboseMode) console.log('(NetChannel) Sending Message, isReliable', aMessageInstance.isReliable, BISON.decode(aMessageInstance.encodedSelf()));
	};


	/**
	 * Adjust the cmd rate based on the current server latency.
	 * @param serverMessage	A full server message containing client info
	 */
	NetChannel.prototype.adjustRate = function(serverMessage)
	{
		this.cmdrate = this.config.CLIENT_SETTING.cmdrate;
	   	var deltaTime = this.gameClock - serverMessage.gameClock;
		this.latency = deltaTime;

//		time -= 100; // Subtract 100ms
//		if(this.)
//		console.log('Time:', time)
		// time -= 0.1; // subtract 100ms
		//
		// if(time <= 0)
		// {
		// 	this.rate = 0.12; /* 60/1000*2 */
		// }
		// else
		// {
		// }
	};


	/**
	* Simple convinience message to compose CMDS.
	* Bison will encode this array for us when we send
	*/
	NetChannel.prototype.composeCommand = function(aCommandConstant, commandData)
	{
		// Create a command
		var command = {};
		// Fill in the data
		command.cmd = aCommandConstant;
		command.data = commandData || {};
		return command;
	};

	/**
	* Determines if it's ok for the client to send a unreliable new message yet
	*/
	NetChannel.prototype.canSend = function ()
	{
//		console.log( this.gameClock , this.lastSentTime , this.cmdrate );
		//console.log( canSend );
		var ready = this.gameClock > this.lastSentTime + this.cmdrate;
		return ready;
	};

	/**
	 * disconnect the client and we're done
	 */
	NetChannel.prototype.dealloc = function()
	{
		this.connection.close();
		this.outgoingCmdBuffer.dealloc();
		delete this.connection;
		delete this.incommingCmdBuffer;
		delete this.outgoingCmdBuffer;
	};
	return NetChannel;
});

