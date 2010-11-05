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

define('NetChannel', ['Message'], function(Message) {
	
	function NetChannel(aHost, aPort, aController)
	{		
		var that = this; // Forclosures (haw haw)	
		
		// Make sure this controller is valid before moving forward.
		// Function itself
		if(this.validateController(aController) == false) {
			console.log("(NetChannel) Controller " + aController + " is undefined or does not conform to the valid methods. Ignored."); 	 
			return;
		};
		
		this.controller = aController;	// For callbacks once messages are validated
		
		// connection info
		this.frameLatency = 0; 	// lag over time
		this.frameRate = 0;		
	
		// Connection timings
		this.latency = 1000; // lag right now
		// 
		this.realTime = -1;
		this.lastRecievedTime = 0; // Last time we received a message
		// When we  can send another message to prevent flooding - determined by 'rate' variable
		this.clearTime = 0; // if realtime > nc->cleartime, free to go
		
		this.rate = 1000;	// seconds / byte
		
		this.incomingSequence = 0;
		this.outgoingSequence = 0;
		
		// array of the last 31 messages sent
		this.messageBuffer = [];
		this.MESSAGE_BUFFER_MASK = 31; // This is used in the messageBuffer bitmask - It's the sequence number
		
		// We send this, and we wait for the server to send back matching seq.number before we empty this. 
		// When this is empty, then we can send whatever the next one is
		this.reliableBuffer = null;  // store last sent message here
		
		this.connection = new WebSocket('ws://' + aHost + ':' + aPort);
		this.connection.onopen = function() { that.onConnectionOpened(); };
		this.connection.onmessage = function(messageEvent) { that.onServerMessage(messageEvent); };
		this.connection.onclose = function() { that.onConnectionClosed(); };
		
		this.clientID = -1;
		console.log("(NetChannel) Created with socket: ", this.connection);
	}
	
	/**
	* Check if a controller conforms to our required methods
	* Later on we can add new things here to make sure this controller is valid to make cheating at least slightly more  difficult
	*/
	NetChannel.prototype.validateController = function(aController)
	{
		var isValid = true; // Assume true
		if(aController &&  aController.netChannelDidConnect && aController.netChannelDidReceiveMessage && aController.netChannelDidDisconnect) {
		} else {
			isValid = false;
		}
		
		return isValid;
	}
	
	NetChannel.prototype.tick = function(gameClockTime)
	{
		this.realTime = gameClockTime;
		
		for (messageIndex in this.messageBuffer)
		{
			var message = this.messageBuffer[messageIndex];
			// Still waiting for last message to be ok'ed	
			if(message.isReliable && this.reliableBuffer === null)
			{
				this.sendMessage(message);
				break;
			}
		}
	};
	
	/**
	* Messages from the FROM / SERVER
	**/
	NetChannel.prototype.onConnectionOpened = function ()
	{
		// Create a new message with the SERVER_CONNECT command
		this.addMessageToQueue(true, this.composeCommand(COMMANDS.SERVER_CONNECT, null) );
	};
	
	NetChannel.prototype.onServerMessage = function (messageEvent)
	{	
		var serverMessage = BISON.decode(messageEvent.data);
		
		console.log("(NetChannel) onServerMessage: ", messageEvent, serverMessage);
		
		// Catch garbage
		if(serverMessage === undefined || messageEvent.data === undefined || serverMessage.seq === undefined) 
			return;
			
		// This is a special command after connecting and the server OK-ing us - it's the first real message we receive
		// So we have to put it here, because otherwise e don't actually have a true client ID yet so the code below will not work
		if(serverMessage.cmds.cmd == COMMANDS.SERVER_CONNECT) {
			this.onServerDidAcceptConnection(serverMessage);
		}
		
		// We sent this, clear our reliable buffer que
		if(serverMessage.id == this.clientID) 
		{
			this.latency = this.realTime - serverMessage.messageTime;
			
			var messageIndex =  serverMessage.seq & this.MESSAGE_BUFFER_MASK;
			var message = this.messageBuffer[messageIndex];
			
			
			console.log(this.reliableBuffer, message, this.reliableBuffer === message);
			// Free up reliable buffer to allow for new message to be sent
			if(this.reliableBuffer === message)
				this.reliableBuffer = null;
				
			// Remove from memory
			delete this.messageBuffer[messageIndex];
//			delete message;
		} else {
			// No fancy behavior for other peoples messages for now.
			// 
		}
			
		
		// Every other server message
		if(serverMessage.cmds.cmd != COMMANDS.SERVER_CONNECT) {
			this.controller.netChannelDidReceiveMessage(serverMessage);
		}
//		delete serverMessage;
	};
	
	NetChannel.prototype.onConnectionClosed = function (serverMessage)
	{
		console.log('(NetChannel) onConnectionClosed');
	};
	
	// onConnectionOpened is for the WebSocket - however we still don't have a 'clientID', this is what we get back when we were OK'ed and created by the server 
	NetChannel.prototype.onServerDidAcceptConnection = function(serverMessage)
	{
		// Only the server can create client ID's - grab the one i returned for us;
		this.clientID = serverMessage.id;
		
		console.log('(NetChannel) Setting clientID to', this.clientID);
		
		this.controller.netChannelDidConnect(serverMessage);		
		
	};
	
	/**
	* HELPER METHODS
	**
	
	/**
	* Simple convinience message to compose commands.
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
	}
	
	/**
	* Sending Messages
	*/
	NetChannel.prototype.addMessageToQueue = function(isReliable, anUnencodedMessage)
	{
		this.outgoingSequence += 1;
		var message = new Message(this.outgoingSequence, isReliable, anUnencodedMessage);
		message.clientID = this.clientID;
		
		// Add to array the queue
		this.messageBuffer[this.outgoingSequence & this.MESSAGE_BUFFER_MASK] = message;
		console.log('(NetChannel) Adding Message to que', this.messageBuffer[this.outgoingSequence & this.MESSAGE_BUFFER_MASK], " ReliableBuffer currently contains: ", this.reliableBuffer);
	}
	
	NetChannel.prototype.sendMessage = function(aMessageInstance)
	{
		aMessageInstance.messageTime = this.realTime; // Store to determin latency
		this.reliableBuffer = aMessageInstance; // Block new connections
		
		this.connection.send(aMessageInstance.encodedSelf());
		
		console.log('(NetChannel) Sending Message ', BISON.decode(aMessageInstance.encodedSelf()));
	}
	
	return NetChannel;
});