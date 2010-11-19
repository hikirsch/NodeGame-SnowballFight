/**
File:
	ServerNetChannel.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	-> Clientside netchannel talks to this object
	<--> This object talks to it's GameController
 	  <-- This object broadcast the message to all clients
Basic Usage: 
	var server = new ServerNetChannel(this,
	{
	    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
	    'status': false,
	    'recordFile': './../record[date].js',
	    'record': false,
	    'server': null
	});
	
	server.run();
*/

var sys = require('sys');
var ws = require('./ws.js');
var BISON = require('../lib/bison.js');
var Client = require('../model/Client.js').Class;

(function(){
	exports.Class = Class.extend({
		init: function(options) 
		{
			// the server game controller, this guy maintains the entire game
			this.controller = options.controller;
			
			// Connection options
			this.port = options.port;

			this.bytes = {
				sent: 0,
				received: 0
			};

			// Connections
			this.clients = {};		// Everyone connected
			this.clientCount = 0;	// Length of above
			this.nextClientID = 0;	// UUID for next client
		    
			/* Recording
			this.record = config.record || false;
			this.recordFile = config.recordFile || './record[date].js';
			this.recordData = [];
			*/
			// Map COMMAND values to functions to avoid a giant switch statement as this expands
			this.COMMAND_TO_FUNCTION = {};
			this.COMMAND_TO_FUNCTION[config.COMMANDS.SERVER_CONNECT] = this.onClientConnected;
			this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_JOINED] = this.onPlayerJoined;
			this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_DISCONNECT] = this.onRemoveClient;
			this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_MOVE] = this.onPlayerMoveCommand;
		
		    this.initAndStartWebSocket();
		}, 
		
		/**
		 * Initialize and start the websocket server.
		 * With this set up we should be abl to move to Socket.io easily if we need to
		 */
		initAndStartWebSocket: function()
		{
			var that = this;
			// START THE WEB-SOCKET
			this.server = new ws.Server();

			/**
			 * onConnect() - all callback function from ws.Server(), this will fire when someone connects to the server 
			 * @param connection
			 */
			this.server.onConnect = function(connection)
			{
				that.controller.log("(ServerNetChannel) onConnect:", connection);
				that.controller.log("(ServerNetChannel) UserConnected:", connection);
			};
			
			/**
			* Received a message from a client/
			* Messages can come as a single message, or grouped into an array of commands.
			*/
			this.server.onMessage = function(connection, encodedMessage )
			{
				try 
				{
					var decodedMessage = BISON.decode(encodedMessage),
						sequenceNumber = decodedMessage.sequenceNumber,
						message,
						messageIndex;

					that.bytes.received += encodedMessage.length;
					
					/**
					 * this is what a message "payload" will look like
						{
							sequenceNumber: 1,
							isReliable: true,
							messages: [
							  { cmd: whatever, data: { } }
							  { cmd: whatever2, data: { } }
							  { cmd: whatever3, data: { } }
							]
						}
					 */

					for( messageIndex in decodedMessage.messages )
					{
						message = decodedMessage.messages[ messageIndex ];
						that.COMMAND_TO_FUNCTION[ message.cmd ].apply( that, [ connection, sequenceNumber, message ] );
					}
				}
				catch( e )
				{ // If something went wrong, just remove this client and avoid crashign
					that.controller.log( e.stack );
					that.controller.log('!! Error: ' + e);
					connection.close();
				}
			};

			/**
			 * onClose() - This will fire when the connection is closed.
			 * @param {Object} connection the connection object that closed the connection
			 */
			this.server.onClose = function(connection) {
				that.removeClient(connection);
			};
			
			// Start listening
			this.controller.log('(ServerNetChannel) Listening.');
			this.server.listen(this.port);
		},

		/**
		 *  start() - start the NetChannel
		 */
		start: function()
		{
			// we do it on the next tick since this is what is recommended by Node.js
			process.nextTick( this.doStart );
		},

		/**
		 * doStart() - This is processed on the nextTick, we mark the current time so we know when we started this game
		 * and we add an event listener on the process so if it quits, we shutdown properly.
		 */
		doStart: function()
		{
			this.time = this.startTime = new Date().getTime();

			// Listen for termination
			process.addListener('SIGINT', this.shutdown );
		},

		/**
		 * shutdown() - Shut down the server
		 */
		shutdown: function()
		{
			// TODO: figure out if we really need to do a timeout here, this was originally part of NodeGame-Shooter
			setTimeout( this.doShutdown, 100 );
		},

		/**
		 * doShutdown() - shutdown the server, first disconnect everyone and then shutdown the process
		 */
		doShutdown: function() {
			// Tell all the clients then close
			for(var aClient in this.clients)
			{
				try
				{
					this.clients[aClient].close();
				}
				catch( e )
				{
				}
			}

			// that.saveRecording();
			this.controller.log('>> Shutting down...');
			process.exit(0);
		},
		
		//Set the clients 'nickName' as defined by them
		setClientPropertyNickName: function(connection, aDecodedMessage)
		{
			var nickname = aDecodedMessage.data.nickname;
			
			this.controller.log('(ServerNetChannel) Setting nickname for ' + connection.$clientID + ' to ' +  nickname);
			this.clients[ connection.$clientID ].enabled = true;
			this.clients[ connection.$clientID ].nickname = nickname;
		},

		/**
		 * addClient() - Add a new client to connected users - player is not in the game yet
		 * @param {Object} connection the connection of the player we are adding
		 */
		addClient: function( connection )
		{
			var clientID = this.nextClientID++;

			connection.$clientID = clientID;

			// create the new client and add to our list of connected users
			this.clients[clientID] = new Client(this, connection, false);

			return clientID;
		},

		/**
		 * onRemoveClient() - Remove the client from a game.
		 * @param {Object} connection the connection object for the user who joined
		 * @param {Number} sequenceNumber the ID number of the message
		 * @param {Object} aDecodedMessage the message that got sent from the connection
		 */
		onRemoveClient: function(connection, sequenceNumber, aDecodedMessage )
		{
			var clientID = connection.$clientID;
			
			// check to make sure that we are disconnecting a client ID that we still have
			if( clientID in this.clients )
			{
				this.controller.log("(ServerNetChannel) Disconnecting client: " + clientID );

				// if this client is mid game playing then we need to tell the other players to remove it
				if( this.clients[ clientID ].enabled  )
				{
					// before we actually remove this guy, make tell everyone else
					this.relayMessage(connection.$clientID, MESSAGES.REMOVE_FOREIGN_CHARACTER, { clientID: connection.$clientID });
				}

				// Free the slot
				delete this.clients[ clientID ];

				this.clientCount--;
			}
			else
			{
				this.controller.log("(ServerNetChannel) Attempted to disconnect unknown client!: " + clientID );
			}
		},
		
		/**
		 * onClientConnected() - the client connected, so we need to assign a new clientID
		 * for this user. We send the connect message back to the client with their clientID.
		 * User has connected, give them an ID, tell them - then tell all clients
		 * @param {Object} connection the connection object for the user who joined
		 * @param {Number} sequenceNumber the ID number of the message
		 * @param {Object} aDecodedMessage the message that got sent from the connection
		 */
		onClientConnected: function( connection, sequenceNumber, aDecodedMessage )
		{
			// Get new ID for client
			var newClientID = this.addClient(connection);

			aDecodedMessage.data.clientID = newClientID;
			
			this.controller.log( '(ServerNetChannel) Adding new client to listeners with ID: ' + newClientID );

			// Send only the connecting client a special connect message by modifying the message it sent us, to send it - 'SERVER_CONNECT'
			connection.send( BISON.encode( aDecodedMessage ) );
		},

		/**
		 * onPlayerJoined() - a callback for when a player is joining the game, the player will be
		 * able to participate in the game after this function finishes.
		 * @param {Object} connection the connection object for the user who joined
		 * @param {Number} sequenceNumber the ID number of the message
		 * @param {Object} aDecodedMessage the message that got sent from the connection
 		 */
		onPlayerJoined: function( connection, sequenceNumber, aDecodedMessage )
		{
			this.controller.log('(ServerNetChannel) Player joined from connection #' + connection.$clientID);
			this.controller.addClient(connection.$clientID);
			this.controller.setNickNameForClientID(aDecodedMessage.data.nickName, connection.$clientID);
			
			// Tell all the clients that a player has joined
			this.broadcastMessage( connection.$clientID, aDecodedMessage, true );
		},
		
		/**
		 * Send this to all clients, and let the gamecontroller do what it should with the message
		 */
		onPlayerMoveCommand: function( connection, sequenceNumber, aDecodedMessage )
		{
			// tell our game that we got a generic message
			this.controller.onPlayerMoveCommand( connection.$clientID, aDecodedMessage );

			// rebroadcast this message so all of our clients know
			this.broadcastMessage( connection.$clientID, aDecodedMessage, false );
		},
		
		/**
		 * Message Sending
		 * @param originalClientID		The connectionID of the client this message originated from
		 * @param anUnencodedMessage	Human readable message data
		 * @param sendToOriginalClient	If true the client will receive the message it sent. This should be true for 'reliable' events such as joining the game
		 */
		broadcastMessage: function( originalClientID, anUnencodedMessage, sendToOriginalClient )
		{
			var encodedMessage = BISON.encode(anUnencodedMessage),
				clientID;
			
			// this.controller.log('Init Broadcast Message From:' + originalClientID, sys.inspect(anUnencodedMessage));
			
			// Send the message to everyone, except the original client if 'sendToOriginalClient' is true
			for( clientID in this.clients )
			{
				// if the original client ID is the next client and we want to send it to that client
				// or the client id is not the one where the message originated from, then send the message
				if( ( clientID == originalClientID && sendToOriginalClient ) || clientID != originalClientID )
				{
					this.clients[ clientID ].sendMessage( encodedMessage );
					this.bytes.sent += encodedMessage.length;
				}
			}
		}
	});// Close .extend
})(); // close init()


