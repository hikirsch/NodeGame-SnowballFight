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
			// our configuration
			var config = options.config;
			
			// Delegation pattern, should avoid subclassing
			this.delegate = options.delegate;
			
			// Connection options
			this.maxChars = config.maxChars || 128;
			this.maxClients = config.maxClients || 64;
			this.port = config.PORT || 8000;
			this.showStatus = config.status === false ? false : true;

			this.bytes = {
				sent: 0,
				received: 0
			}

		    // Connections
		    this.clients = {};		// Everyone connected
		    this.clientCount = 0;	// Length of above
		    this.nextClientID = 0;		// UUID for next client
		    
		    // Recording
		    this.record = config.record || false;
		    this.recordFile = config.recordFile || './record[date].js';
		    this.recordData = [];
		    
		    // Map COMMAND values to functions to avoid a giant switch statement as this expands
		    this.COMMAND_TO_FUNCTION = {};

		    this.COMMAND_TO_FUNCTION[config.COMMANDS.SERVER_CONNECT] = this.onClientConnected;
		    this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_JOINED] = this.onPlayerJoined;
		    this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_DISCONNECT] = this.removeClient;
		    this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_MOVE] = this.onGenericPlayerCommand;
		    this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_FIRE] = this.genericCommand;
		
		    this.initAndStartWebSocket(config);
		}, 
		
		/**
		 * Initialize and start the websocket server.
		 * With this set up we should be abl to move to Socket.io easily if we need to
		 */
		initAndStartWebSocket: function(options)
		{
			// START THE WEB-SOCKET
			var that = this;
			this.$ = new ws.Server(options.server || null);
			
			this.$.onConnect = function(connection)
			{
				that.delegate.log("(ServerNetChannel) onConnect:", connection);
				that.delegate.log("(ServerNetChannel) UserConnected:", connection);
			};
			
			/**
			* Received a message from a client/
			* Messages can come as a single message, or grouped into an array of commands.
			*/
			this.$.onMessage = function(connection, encodedMessage )
			{
				try 
				{
					that.bytes.received += encodedMessage.length;
					
					var decodedMessage = BISON.decode(encodedMessage);
					
					if(decodedMessage.cmds instanceof Array == false)
					{
						// Call the mapped function, always pass the connection. Also pass data if available
						that.COMMAND_TO_FUNCTION[decodedMessage.cmds.cmd].apply(that, [connection, decodedMessage]);
					} 
					else // An array of commands
					{
						for(var singleCommand in decodedMessage.cmds){
							that.COMMAND_TO_FUNCTION[singleCommand.cmd](singleCommand.data);
						};
					}	
				} 
				catch (e)
				{ // If something went wrong, just remove this client and avoid crashign
					that.delegate.log(e.stack);
					that.delegate.log('!! Error: ' + e);
					connection.close();
				}
			}
			
			this.$.onClose = function(connection) {     
				that.removeClient(connection);
			};
			
			// Start listening
			this.delegate.log('(ServerNetChannel) Listening.');
			this.$.listen(this.port);
		},
		
		// Create a callback to call 'start' on the next event loop
		run: function()
		{
			var that = this;
			process.nextTick(function() {
				that.start();
			});
		},
		
		// Start the server
		start: function()
		{
			var that = this;
			this.startTime = new Date().getTime();
			this.time = new Date().getTime();
			this.delegate.status();
			
			// Listen for termination
			process.addListener('SIGINT', function(){that.shutdown()});
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
				that.delegate.status(true);
				process.exit(0);
			}, 100);
		},
		
		//Set the clients 'nickName' as defined by them
		setClientPropertyNickName: function(connection, aDecodedMessage)
		{
			var nickname = aDecodedMessage.cmds.data.nickname;
			
			this.delegate.log('(ServerNetChannel) Setting nickname for ' + connection.$clientID + ' to ' +  nickname);
			this.clients[connection.$clientID].enabled = true;
			this.clients[connection.$clientID].nickname = nickname;
		},
		
		removeClient: function(connection)
		{
			var clientID = connection.$clientID;
			
			// See if client is playing
			//noinspection PointlessBooleanExpressionJS,PointlessBooleanExpressionJS
			if( clientID in this.clients == false)
			{
				this.delegate.log("(ServerNetChannel) Attempted to disconnect unknown client!:" + clientID );
				return;
			}
			
			
			this.delegate.log("(ServerNetChannel) Disconnecting client: " + clientID );
					
			// if this client is mid game playing then we need to tell the other players to remove it
			if( this.clients[ clientID ].enabled  )
			{
				// before we actually remove this guy, make tell everyone else
				this.relayMessage(connection.$clientID, MESSAGES.REMOVE_FOREIGN_CHARACTER, { clientID: connection.$clientID });
			}
			
			// Free the slot
			this.clients[ clientID ] = null;
			delete this.clients[ clientID ];
			
			this.clientCount--;
		},
		
		/**
		 * CONNECTION EVENTS
		 * User has connected, give them an ID, tell them - then tell all clients
		 */
		onClientConnected: function(connection, aDecodedMessage)
		{
			var data = aDecodedMessage.cmds.data;
			
			// Get new UUID for client
			var newClientID = this.addClient(connection);
			aDecodedMessage.id = newClientID;
			
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
			var clientID = this.nextClientID++;
			this.clientCount++;
			
			connection.$clientID = clientID;
			// Add to our list of connected users
			this.clients[clientID] = new Client(this, connection, false);
			
			return clientID;
		},
		
		// player is now in the game after this 
		onPlayerJoined: function(connection, aDecodedMessage)
		{
			this.delegate.log('(ServerNetChannel) Player joined from connection #' + connection.$clientID);
			this.delegate.addClient(connection.$clientID);
			this.delegate.setNickNameForClientID(aDecodedMessage.cmds.data.nickName, connection.$clientID);
			
			// Tell all the clients that a player has joined
			this.broadcastMessage(connection.$clientID, aDecodedMessage, true);
		},
		
		/**
		 * Send this to all clients, and let the gamecontroller do what it should with the message
		 */
		onGenericPlayerCommand: function(connection, aDecodedMessage)
		{
			this.delegate.onGenericPlayerCommand(connection.$clientID, aDecodedMessage);
			this.broadcastMessage(connection.$clientID, aDecodedMessage, false);
		},
		
		/**
		 * Message Sending
		 * @param originalClient		The connectionID of the client this message originated from
		 * @param anUnencodedMessage	Human readable message data
		 * @param sendToOriginalClient	If true the client will receive the message it sent. This should be true for 'reliable' events such as joining the game
		 */
		broadcastMessage: function(originalClientID, anUnencodedMessage, sendToOriginalClient)
		{
			var encodedMessage = BISON.encode(anUnencodedMessage);
			// this.delegate.log('Init Broadcast Message From:' + originalClientID, sys.inspect(anUnencodedMessage));
			
			// Send the message to everyone, except the original client if 'sendToOriginalClient' is true
			for( var clientID in this.clients )
			{
				// Don't send to original client
				if( sendToOriginalClient == false && clientID == originalClientID ) 
					continue;
				
				this.clients[clientID].sendMessage(encodedMessage);
				this.bytes.sent += encodedMessage.length;
			}
		} // Close prototype object
	});// Close .extend
})(); // close init()


