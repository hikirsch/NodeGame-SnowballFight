/**
File:
	ServerNetChannel.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	-> Clientside NetChannel talks to this object
	<--> This object talks to it's GameController
 	  <-- This object broadcast the message to all clients
Basic Usage:

 	var netChannelOptions = {};
	netChannelOptions.HOST = 'localhost';
	netChannelOptions.PORT = 28785;
	netChannelOptions.DEBUG_MODE = true;

 	// These are the 'CMDS' the player sends to the server, and the server sends.
	netChannelOptions.CMDS = {};
 	netChannelOptions.CMDS.SERVER_CONNECT: 2;
 	netChannelOptions.CMDS.PLAYER_JOINED: 1;
 	netChannelOptions.CMDS.PLAYER_DISCONNECT: 4;
	netChannelOptions.CMDS.PLAYER_MOVE: 8;
	netChannelOptions.CMDS.PLAYER_FIRE: 22;

 	// Create the NetChannel, pass this game instance as the delegate - (which we will defer to when messages are received, and confirmed)
	var netChannel = new ServerNetChannel(this, netChannelOptions);
 
    // Alright everything went well, start the net channel which will create the websocket and start listening
	netChannel.start();
*/

var ws = require('network/ws.js');
require('js/lib/bison.js');
require('js/lib/jsclass/core.js');
require('js/lib/SortedLookupTable.js');
require('model/Client.js');

ServerNetChannel = (function()
{
	return new JS.Class(
	{
		initialize: function(aDelegate, config, port)
		{
			console.log('(ServerNetChannel)::init', config, port);
			// Delegation pattern, avoid subclassing ServerNetChannel
			this.delegate = aDelegate;
			this.config = config;

			// Connection options
			this.maxChars = config.maxChars || 128;
			this.maxClients = config.maxClients || 64;
			this.port = port;

			this.showStatus = config.status !== false;

			this.bytes = {
				sent: 0,
				received: 0
			};
			
		    // Connections
		    this.clients = new SortedLookupTable();		// Everyone connected
		    this.nextClientID = 1;						// UUID for next client - ZERO IS RESERVED FOR THE SERVER

		    // Recording
		    this.record = config.record || false;
		    this.recordFile = config.recordFile || './record[date].js';
		    this.recordData = [];


		    // Map CMD values to functions to avoid a giant switch statement as this expands
		    this.CMD_TO_FUNCTION = {};

		    this.CMD_TO_FUNCTION[config.CMDS.SERVER_CONNECT] = this.onClientConnected;
		    this.CMD_TO_FUNCTION[config.CMDS.PLAYER_JOINED] = this.onPlayerJoined;
		    this.CMD_TO_FUNCTION[config.CMDS.PLAYER_DISCONNECT] = this.removeClient;
		    this.CMD_TO_FUNCTION[config.CMDS.PLAYER_MOVE] = this.onPlayerMoveCommand;
		    this.CMD_TO_FUNCTION[config.CMDS.PLAYER_FIRE] = this.genericCommand;

		    this.initAndStartWebSocket(config);
		},

		/**
		 * Initialize and start the WebSocket server.
		 * With this set up we should be abl to move to Socket.io easily if we need to
		 */
		initAndStartWebSocket: function(options)
		{
			// START THE WEB-SOCKET
			var that = this;
			var aWebSocket = this.$ = new ws.Server(null);

			aWebSocket.onConnect = function(connection)
			{
				that.delegate.log("(ServerNetChannel)::onConnect");
			};

			/**
			* Received a message from a client/
			* Messages can come as a single message, or grouped into an array of commands.
			*/
			aWebSocket.onMessage = function(connection, encodedMessage )

			{
				var client;
				try
				{
					that.bytes.received += encodedMessage.length;
					var decodedMessage = BISON.decode(encodedMessage);

					// Tell the Client of this connection that a message was received
					if(client = that.clients.objectForKey(decodedMessage.id)) {
						client.onMessage(decodedMessage);
					}

					// Call the mapped function, always pass the connection. Also pass data if available
					that.CMD_TO_FUNCTION[decodedMessage.cmds.cmd].apply(that, [connection, decodedMessage]);

				}
				catch (e)
				{ // If something went wrong, just remove this client and avoid crashign

					console.log('!! Error: ' + e);
					that.delegate.log(e.stack);
					that.delegate.log('!! Error: ' + e);
					connection.close();
				}
			};

			aWebSocket.onClose = function(connection) {
				that.removeClient(connection);
			};
		},

		// Create a callback to call 'start' on the next event loop
		start: function()
		{
			var that = this;
			process.nextTick(function() {
				that.startInternal();
			});
		},

		// Start the server
		startInternal: function()
		{
			var that = this;
			this.startTime = this.delegate.gameClock;
			this.time = this.startTime;

			// Start the websocket
			this.delegate.log("(ServerNetChannel) Starting listen on port '" + this.port + "'");
			this.$.listen(this.port);

			// Listen for process termination
			process.addListener('SIGINT', function(){that.shutdown()});
		},

		/**
		 * Checks all the clients to see if its ready for a new message.
		 * If they are, have the client perform delta-compression on the worldDescription and send it off.
		 * @param gameClock		   The current (zero-based) game clock
		 * @param worldDescription A description of all the entities currently in the world
		 */
		tick: function( gameClock, worldDescription )
		{
			this.gameClock = gameClock;

			// Send client the current world info
			this.clients.forEach( function(key, client)
			{
				// Collapse delta - store the world state
				var deltaCompressedWorldUpdate = client.compressDeltaAndQueueMessage( worldDescription, gameClock );

				// Ask if enough time passed, and send a new world update
				if ( client.canSendMessage(gameClock) ) {
					client.sendQueuedCommands(gameClock);
				}

			}, this );
		},

		/**
		 * Broadcasts a message to all connected Clients (does not ask client if its ok to receive)
		 * @param aDecodedMessage An object
		 */
		broadcastMessage: function(aDecodedMessage)
		{
			var encodedMessage = BISON.encode(aDecodedMessage);
			this.clients.forEach( function(key, client)
			{
				client.sendMessage(encodedMessage, this.gameClock);
			}, this);
		},

		// Shut down the server
		shutdown: function()
		{
			// Tell all the clients then close
			var that = this;
			setTimeout(function() {
				for(var aClient in that.clients)
				{
					try { that.clients[aClient].close(); } catch( e ) { }
				}

				// that.saveRecording();
				that.delegate.log('>> Shutting down...');
				process.exit(0);
			}, 100);
		},

		removeClient: function(connection)
		{
			var clientID = connection.$clientID;
			var aClient = this.clients.objectForKey(clientID);

			// This client is not in our client-list. Throw warning, something has probably gone wrong.
			if(aClient == undefined)
			{
				this.delegate.log("(ServerNetChannel) Attempted to disconnect unknown client!:" + clientID );
				return;
			}


			this.delegate.log("(ServerNetChannel) Disconnecting client: " + clientID );

			// if this client is mid-game, and playing then we need to tell the other players to remove it
			if(aClient.isPlaying) {
				// before we actually remove this guy, make tell everyone else
				this.delegate.removePlayer( clientID );
				// this.relayMessage(connection.$clientID, MESSAGES.REMOVE_FOREIGN_CHARACTER, { clientID: connection.$clientID });
			}

			// Free the slot
			this.clients.remove(clientID);
			connection.close();
		},

		/**
		 * Player has joined the match
		 * @param connection		The clients WebSocket connection
		 * @param aDecodedMessage	A message containing client information
		 */
		onPlayerJoined: function(connection, aDecodedMessage)
		{
			this.delegate.log('(ServerNetChannel) Player joined from connection #' + connection.$clientID );

			// Create an entity ID for this new player
			// This is done here, because shouldAddPlayer is the same on client and server, and only the server can define client entities
			var entityID = this.delegate.getNextEntityID(),
                clientID = connection.$clientID,
                aClient = this.clients.objectForKey( clientID );

            // if set to false then clients will stay in the game
            aClient.isPlaying = true;

			var characterModel = {theme: aDecodedMessage.cmds.data.theme, nickname: aDecodedMessage.cmds.data.nickname};
			this.delegate.shouldAddPlayer(entityID, clientID, characterModel );

			connection.send( BISON.encode(aDecodedMessage) );
		},

		/**
		 * CONNECTION EVENTS
		 * User has connected, give them an ID, tell them - then tell all clients
		 */
		onClientConnected: function(connection, aDecodedMessage)
		{
			var data = aDecodedMessage.cmds.data;

			// Create a new client, note UUID is incremented
			var newClientID = this.addClient(connection);
			aDecodedMessage.id = newClientID;
			aDecodedMessage.gameClock = this.delegate.gameClock;
			aDecodedMessage.gameModel = this.delegate.model;

			this.delegate.log('(ServerNetChannel) Adding new client to listeners with ID: ' + newClientID );

			// Send only the connecting client a special connect message by modifying the message it sent us, to send it - 'SERVER_CONNECT'
			connection.send( BISON.encode(aDecodedMessage) );
		},

		/**
		 * Client Addition -
		 * Added client to connected users - player is not in the game yet
		 */
		addClient: function(connection)
		{
			connection.$clientID = this.getNextClientID();
			var aClient = new Client(this, connection, this.config, this.bytes);

			// Add to our list of connected users
			this.clients.setObjectForKey( aClient, connection.$clientID);

			return connection.$clientID ;
		},

		/**
		 * Returns a client for a given ID
		 * @param clientID
		 */
		getClientWithID: function(clientID)
		{
			return this.clients.objectForKey(clientID);
		},

		/**
		 * Send this to all clients, and let the gamecontroller do what it should with the message
		 * @deprecated
		 */
		onGenericPlayerCommand: function(connection, aDecodedMessage)
		{
			throw("ERROR"); // This is deprecated
		},

		onPlayerMoveCommand: function(connection, aDecodedMessage)
		{
			this.delegate.onPlayerMoveCommand(connection.$clientID, aDecodedMessage);
		},

		getNextClientID: function()
		{
			return this.nextClientID++;
		},

		/**
		 * SETTING CLIENT PROPERTIES
		 * Called by clients to modify a property.
		 * If the server accepts the change (it is within bounds, name contains valid string, etc) the Client's property is updated.
		 */

		//Set the clients 'nickName' as defined by them
		setClientPropertyNickName: function(connection, aDecodedMessage)
		{
			var nickname = aDecodedMessage.cmds.data.nickname;
			this.delegate.log('(ServerNetChannel) Setting nickname for ' + connection.$clientID + ' to ' +  nickname);
		},

		dealloc: function()
		{
			this.clients.forEach(function(key, aClient) {
				this.removeClient(aClient.conn);
			}, this);

//			for(var aClient in this.clients)
//			{
//				try { this.clients[aClient].close(); } catch( e ) { }
//			}
			this.$.stopListening();
			console.log("(ServerNetChannel) Closing Port: " + this.port );
		}
		// Close prototype object
	});// Close .extend
})(); // close init()


