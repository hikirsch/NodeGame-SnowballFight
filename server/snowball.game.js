var sys = require('sys');
var fs= require('fs');

var ws = require('./ws');
var BISON = require('./bison');

// Right now this is copy-pasted, maybe on connect the client should be sent this info - 
// Instead of letting the client determin these values on its own?
var COMMANDS = {
	PLAYER_CONNECT		: 0x01,	// When a new player has connected
	SERVER_CONNECT		: 0x02, // When the server responds back on connect
	PLAYER_DISCONNECT	: 0x04,
	PLAYER_MOVE			: 0x08,
	PLAYER_FIRE			: 0x16
};

function Server(aDelegate, options) {
	this.delegate = aDelegate;
	this.maxChars = options.maxChars || 128;
    this.maxClients = options.maxClients || 64;
    this.port = options.port || 8000;
    this.showStatus = options.status === false ? false : true;
    
    // Server
    this.fields = {};
    this.fieldsChanged = false;
    this.logs = []; 
    
    // Client
    this.clients = {};
    this.clientCount = 0;
    this.clientID = 0;
    
    // Actors
    this.actorCount = 0;
    this.actorID = 0;
    this.actorTypes = {};
    this.actors = {};
    
    this.bytesSend = 0;
    this.bytesSendLast = 0;
    
    // Recording
    this.record = options.record || false;
    this.recordFile = options.recordFile || './record[date].js';
    this.recordData = [];
    
    // Map COMMAND values to functions to avoid a giant switch statement
    this.COMMAND_TO_FUNCTION = [];
    this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_CONNECT] = this.onClientConnected;
    this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_DISCONNECT] = this.removeClient;
    this.COMMAND_TO_FUNCTION[COMMANDS.MOVE] = this.genericCommand;
    this.COMMAND_TO_FUNCTION[COMMANDS.FIRE] = this.genericCommand;
    
    // Socket
	var that = this;
	this.$ = new ws.Server(options.server || null);
	
	this.$.onConnect = function( conn ) {
		that.logs.push("(Server) UserConnected:", conn);
	};

    this.$.onMessage = function( conn, encodedMessage ) {
		try {
			var decodedMessage = BISON.decode(encodedMessage);
			console.log("(Server) MessageReceived:" + sys.inspect(decodedMessage) + " From " + conn);
			
			// On a browser instanceof causes problems, and is unreliable.
			// We're not in a browser. This is reliable by design in V8 JS engine.
			if(decodedMessage.cmds instanceof Array == false) {
			// Call the mapped function, always pass the connection. Also pass data if available
				that.COMMAND_TO_FUNCTION[decodedMessage.cmds.cmd].apply(that, [conn, decodedMessage]);
			} else { // An array of commands
				for(var singleCommand in decodedMessage.cmds){
					that.COMMAND_TO_FUNCTION[singleCommand.cmd](singleCommand.data);
				};
			}
			return;
			
			// TODO: Place into loop
			
			var singleCommand = msg.msg[0];
			switch( msg.msg[0] ){
				case COMMAND.PLAYER_CONNECT: 
					that.onClientConnected( conn );
					break;
//				case MESSAGES.SET_NICKNAME:
//					that.setNickName( conn, msg.msg[1] );
//					that.updateClient( conn.$clientID, msg.msg[1] );
//					that.relayMessage( conn.$clientID, MESSAGES.ADD_FOREIGN_CHARACTER, {
//						x: that.clients[ conn.$clientID ].x,
//						y: that.clients[ conn.$clientID ].y,
//						rotation: that.clients[ conn.$clientID ].rotation,
//						nickname: that.clients[ conn.$clientID ].nickname
//					});
//					break;
//				case MESSAGES.CHARACTER_UPDATE: 
//					that.updateClient( conn.$clientID, msg.msg[1] );
//					that.relayMessage( conn.$clientID, MESSAGES.CHARACTER_UPDATE, msg.msg[1] );
//					break;
			}
			
			//data.clientID = originClientID;
			console.log('Encoded MSG', sys.inspect(msg));
			for( var clientID in that.clients )
			{
				//if( clientID != originClientID ) {
				
				that.clients[clientID].sendMessage(msg);
				//}
			}
			
			if( msg[0] != MESSAGES.INIT && this.record ) {
				this.recordData.push( conn.$clientID, msg );
			}
// */			
		} catch (e) {
			console.log(e.stack);
			that.logs.push('!! Error: ' + e);
			conn.close();
		}
    }
    
    this.$.onClose = function(conn) {     
		that.removeClient(conn);
    };
    
    // Hey Listen!
    this.$.listen(this.port);
}

Server.prototype = {
	setNickName: function( conn, msg ) {
		this.log('Setting nickname for ' + conn.$clientID + ' to ' + msg.nickname );
		this.clients[ conn.$clientID ].enabled = true;
		this.clients[ conn.$clientID ].nickname = msg.nickname;
	},
	
	updateClient: function( clientID, data ) {
		var client = this.clients[ clientID ];
		client.x = data.x;
		client.y = data.y;
		client.rotation = data.rotation;
	},
	
	onClientConnected: function(conn, aDecodedMessage) {
		
		var data = aDecodedMessage.cmds.data;
		this.log( 'New connection started, clientID = ' + sys.inspect(data) );		
		
		
		var newClientID = this.addClient(conn);
		aDecodedMessage.id = newClientID;
		
		// Tell everyone
		conn.send( BISON.encode(aDecodedMessage) );		
		this.broadcastMessage( newClientID, aDecodedMessage);
//		
//		/*characters[ client.conn.$clientID ] = {
//			x: client.x,
//			y: client.y,
//			rotation: client.rotation,
//			nickname: client.nickname
//		}
//		*/
		// Make sure it's not already connected
//		for( var aClientID in this.clients ) 
//		{
//			if( aClientID != conn.$clientID && this.clients[ aClientID ].enabled ) 
//			{ 
//				var client = this.clients[clientID];
//				characters[ client.conn.$clientID ] = {
//					x: client.x,
//					y: client.y,
//					rotation: client.rotation,
//					nickname: client.nickname
//				}
//			}
//		}
//		
//		this.sendData( conn, [ COMMANDS.PLAYER_CONNECT, { characters: characters } ] );
	},
	
	run: function() {
	    var that = this;
	    process.nextTick(function() {
	        that.start();
	    });
	},

	composeCommand: function(aCommandConstant, commandData)
	{
		// Create a command
		var command = {};
		// Fill in the data
		command.cmd = aCommandConstant;
		command.data = commandData || {};
		return command;
	},
	
	broadcastMessage:function( originalClientID, anUnencodedMessage ) {
		var encodedMessage = BISON.encode(anUnencodedMessage);
		console.log('anUnencodedMessage', anUnencodedMessage);
		
//		data.clientID = originalClientID;
		for( var clientID in this.clients ) {
			if( clientID != originalClientID ) {
				this.clients[clientID].sendMessage(encodedMessage);
			}
		}
	},

	start: function() {
	    var that = this;

	    this.startTime = new Date().getTime();
	    this.time = new Date().getTime();
	    this.log('>> Server Started at: ' + this.time);
		// this.$$.start();
	    this.status();
	
	    process.addListener('SIGINT', function(){that.shutdown()});
	},

	shutdown: function() {
	    // this.$$.$running = false;
	    // this.emit(MSG_GAME_SHUTDOWN, this.$$.onShutdown());
	    // this.destroyActors();
	    
	    var that = this;
	    setTimeout(function() {
	        for(var c in that.clients) {
	            try { that.clients[c].close(); } catch( e ) { }
	        }
	        // that.saveRecording();
	        that.log('>> Shutting down...');
	        that.status(true);
	        process.exit(0);
	    }, 100);
	},
	
	addClient: function( conn ){
		this.clientID++;
		this.clientCount++;
		conn.$clientID = this.clientID;
		var aNewClient = new Client( this, conn, false );
		
		this.clients[ this.clientID ] = aNewClient;
		
		this.delegate.shouldAddNewClientWithID(this.clientID);
		return this.clientID;
	},
	
	removeClient: function( conn ) {
		var clientID = conn.$clientID;
		this.log( "disconnecting client: " + clientID );
	
		
		if( clientID in this.clients ) {
			// if this client actually is playing then we need to tell the other players to remove it
			if( this.clients[ clientID ].enabled  ) {
				// before we actually remove this guy, make tell everyone else
				this.relayMessage( conn.$clientID, MESSAGES.REMOVE_FOREIGN_CHARACTER, { clientID: conn.$clientID });
			}
			this.clients[ clientID ] = null;
			delete this.clients[ clientID ];
		} 
	
		this.clientCount--;
	},

	/**
	 * Helper Methods for Logging
	 */
	getTime: function() {
	    return this.time;
	},

	timeDiff: function(time) {
	    return this.time - time;
	},

	log: function(str) {
	    if (this.showStatus) {
	        this.logs.push([this.getTime(), str]);
	        if (this.logs.length > 20) {
	            this.logs.shift();
	        }

	    } else {
	        console.log(str);
	    }
	},

	toSize: function(size) {
	    var t = 0;
	    while(size >= 1024 && t < 2) {
	        size = size / 1024;
	        t++;
	    }
	    return Math.round(size * 100) / 100 + [' bytes', ' kib', ' mib'][t];
	},

	toTime: function(time) {
	    var t = Math.round((time - this.startTime) / 1000);
	    var m = Math.floor(t / 60);
	    var s = t % 60;
	    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
	},

	status: function(end) {
	    var that = this;
	    if (!this.showStatus) {
	        return;
	    }
	    
	    var stats = '    Running ' + this.toTime(this.time) + ' | '
	                + this.clientCount
	                + ' Client(s) | ' + this.actorCount + ' Actor(s) | '
	                + this.toSize(this.bytesSend)
	                + ' send | '
	                + this.toSize((this.bytesSend - this.bytesSendLast) * 2)
	                + '/s\n';
	    
	    this.bytesSendLast = this.bytesSend;
	    for(var i = this.logs.length - 1; i >= 0; i--) {
	        stats += '\n      ' + this.toTime(this.logs[i][0])
	                            + ' ' + this.logs[i][1];
	    }
	    sys.print('\x1b[H\x1b[J# NodeGame Server at port '
	              + this.port + '\n' + stats + '\n\x1b[s\x1b[H');
	                
	    if (!end) {
	        setTimeout(function() {that.status(false)}, 500);
	    
	    } else {
	        sys.print('\x1b[u\n');
	    }
	}
};

exports.Server = Server;

function Client( server, conn, record ) {
	this.conn = conn;
	this.record = record;
	this.$ = server;
};

Client.prototype.onMessage = function(msg) { }

Client.prototype.sendMessage = function( encodedMessage ) {
	this.conn.send( encodedMessage );
};