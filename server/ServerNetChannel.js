var sys = require('sys');
var ws = require('./lib/ws');
var BISON = require('./lib/bison');
var COMMANDS = require('./../client/js/config.js').COMMANDS;
require('./lib/Logger');
require('./Client');

(function(){
	this.ServerNetChannel = Class.extend({
		init: function(aDelegate, options) 
		{
			// Delegation pattern, should avoid subclassing
			this.delegate = aDelegate;
			
			// Connection options
			this.maxChars = options.maxChars || 128;
			this.maxClients = options.maxClients || 64;
			this.port = options.port || 8000;
			this.showStatus = options.status === false ? false : true;
			
			// Info
			console.log(Logger);
		    this.logger = new Logger(this);
		    
		    // Connections
		    this.clients = {};		// Everyone connected
		    this.clientCount = 0;	// Length of above
		    this.clientID = 0;		// UUID for next client
		    
		    // Recording
		    this.record = options.record || false;
		    this.recordFile = options.recordFile || './record[date].js';
		    this.recordData = [];
		    
		    // Map COMMAND values to functions to avoid a giant switch statement
		    this.COMMAND_TO_FUNCTION = {};
		    this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_CONNECT] = this.onClientConnected;
		    this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_DISCONNECT] = this.removeClient;
		    this.COMMAND_TO_FUNCTION[COMMANDS.MOVE] = this.genericCommand;
		    this.COMMAND_TO_FUNCTION[COMMANDS.FIRE] = this.genericCommand;
		
		    this.initAndStartWebSocket(options);
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
				console.log("(ServerNetChannel) onConnect:",connection);
				that.logger.push("(ServerNetChannel) UserConnected:", connection);
			};
			
			this.$.onMessage = function(connection, encodedMessage )
			{
				console.log("(ServerNetChannel) MSG:",BISON.decode(encodedMessage));
				try 
				{
					var decodedMessage = BISON.decode(encodedMessage);
					console.log("(ServerNetChannel) MessageReceived:" + sys.inspect(decodedMessage) + " From " + connection);
					
					// On a browser instanceof causes problems, and is unreliable.
					// We're not in a browser. This is reliable by design in V8 JS engine.
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
				} catch (e) { // If something went wrong, just remove this client and avoid crashign
					console.log(e.stack);
					that.logger.push('!! Error: ' + e);
					connection.close();
				}
			}
			
			this.$.onClose = function(connection) {     
				that.removeClient(connection);
			};
			
			// Start listening
			console.log('Listen ', this.$);
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
			this.logger.status();
			
			// Listen for termination
			process.addListener('SIGINT', function(){that.shutdown()});
		},
		
		// Shut down the server
		shutdown: function()
		{
			// Tell all the clients then close
			var that = this;
			setTimeout(function() {
			    for(var aClient in that.clients) {
			        try { that.clients[aClient].close(); } catch( e ) { }
			    }
			    
			    // that.saveRecording();
			    that.logger.log('>> Shutting down...');
			    that.logger.status(true);
			    process.exit(0);
			}, 100);
		},
		
		/**
		*	Client Addition
		*/
		addClient: function(connection)
		{
			this.clientID++;
			this.clientCount++;
			
			connection.$clientID = this.clientID;
			var aNewClient = new Client(this, connection, false);
			
			// Add and tell the delegate
			this.clients[this.clientID] = aNewClient;
			this.delegate.shouldAddNewClientWithID(this.clientID);
		},
		
		//Set the clients 'nickName' as defined by them
		setClientPropertyNickName: function(connection, aDecodedMessage)
		{
			var nickname = aDecodedMessage.cmds.data.nickname;
			
			this.logger.log('(ServerNetChannel) Setting nickname for ' + connection.$clientID + ' to ' +  nickname);
			this.clients[connection.$clientID].enabled = true;
			this.clients[connection.$clientID].nickname = nickname;
		},
		
		removeClient: function(connection)
		{
			var clientID = connection.$clientID;
			
			// See if client is playing
			if( clientID in this.clients == false) {
				this.logger.log("(ServerNetChannel) Attempted to disconnect unknown client!:" + clientID );
				return;
			}
			
			
			this.logger.log("(ServerNetChannel) Disconnecting client: " + clientID );
					
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
		*	Message Sending
		*/
		broadcastMessage: function(originalClientID, anUnencodedMessage)
		{
			var encodedMessage = BISON.encode(anUnencodedMessage);
			this.logger.log('anUnencodedMessage', anUnencodedMessage);
			
		//	data.clientID = originalClientID;
			for( var clientID in this.clients ) {
				if( clientID != originalClientID ) {
					this.clients[clientID].sendMessage(encodedMessage);
				}
			}
		},
		
		/**
		*	CONNECTION EVENTS
		*/
		// User has connected, give them an ID, tell them - then tell all clients
		onClientConnected: function(connection, aDecodedMessage)
		{
			var data = aDecodedMessage.cmds.data;
			this.logger.log('New connection started, clientID = ' + sys.inspect(aDecodedMessage) );		
			
			// Get new UUID for client
			var newClientID = this.addClient(connection);
			aDecodedMessage.id = newClientID;
			
			// Send the connecting client a special connect message by modifying the message it sent us, to send it - 'SERVER_CONNECT'
			aDecodedMessage.cmds.cmd = COMMANDS.SERVER_CONNECT;
			connection.send( BISON.encode(aDecodedMessage) );
			
			// Tell everyone
			this.broadcastMessage(newClientID, aDecodedMessage);
		} // Close prototype object
	});// Close .extend
})(); // close init()