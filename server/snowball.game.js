var sys = require('sys');
var fs= require('fs');

var ws = require('./ws');
var BISON = require('./bison');

var MESSAGES = {
	INIT: 1,
	CHARACTER_UPDATE: 2,
	SET_NICKNAME: 3,
	ADD_FOREIGN_CHARACTER: 4,
	REMOVE_FOREIGN_CHARACTER: 5
};

function Server(options) {
	this.maxChars = options.maxChars || 128;
    this.maxClients = options.maxClients || 64;
    this.port = options.port || 8000;
    this.showStatus = options.status === false ? false : true;
    
    // Server
    this.fields = {};
    this.fieldsChanged = false;
    this.logs = []; 
    
    // Client
    this.client = {};
    this.clientCount = 0;
    this.clients = {};
    this.clientID = 0;
    this.clientsChanged = false;
    
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
    
    
    // Socket
	var that = this;
	this.$ = new ws.Server(options.server || null);
	
	this.$.onConnect = function( conn ) {
		console.log("conn "+conn);
	};

    this.$.onMessage = function( conn, msg ) {
    
		try {
			var msg = BISON.decode(msg);

			// that.log( "got message: " + msg[0] );
			// var data = msg.length > 1 ? msg[1] : {};

			switch( msg[0] ) {
				case MESSAGES.INIT: 
					that.handleInit( conn );
					break;
				case MESSAGES.SET_NICKNAME:
					that.setNickName( conn, msg[1] );
					that.updateClient( conn.$clientID, msg[1] );
					that.relayMessage( conn.$clientID, MESSAGES.ADD_FOREIGN_CHARACTER, {
						x: that.clients[ conn.$clientID ].x,
						y: that.clients[ conn.$clientID ].y,
						rotation: that.clients[ conn.$clientID ].rotation,
						nickname: that.clients[ conn.$clientID ].nickname
					});
					break;
				case MESSAGES.CHARACTER_UPDATE: 
					that.updateClient( conn.$clientID, msg[1] );
					that.relayMessage( conn.$clientID, MESSAGES.CHARACTER_UPDATE, msg[1] );
					break;
			}

			if( msg[0] != MESSAGES.INIT && this.record ) {
				this.recordData.push( conn.$clientID, msg );
			}
// */			
		} catch (e) {
			that.log('!! Error: ' + e);
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
	
	handleInit: function( conn ) {
		this.addClient(conn);
		
		this.log( 'New connection started, clientID = ' + conn.$clientID );
		
		var characters = {};

		for( var clientID in this.clients ) {
			if( clientID != conn.$clientID && this.clients[ clientID ].enabled ) { 
				var client = this.clients[clientID];
				characters[ client.conn.$clientID ] = {
					x: client.x,
					y: client.y,
					rotation: client.rotation,
					nickname: client.nickname
				}
			}
		}
		
		this.sendData( conn, [ MESSAGES.INIT, { characters: characters } ] );
	},

	sendData: function(conn, msg ) {
		var encodedMessage = BISON.encode( msg );
		conn.send( encodedMessage );
	},
	
	run: function() {
	    var that = this;
	    process.nextTick(function() {
	        that.start();
	    });
	},

	relayMessage: function( originClientID, msg, data ) {
		data.clientID = originClientID;
		for( var clientID in this.clients ) {
			if( clientID != originClientID ) {
				this.clients[clientID].sendMessage([ msg, data ]);
			}
		}
	},

	start: function() {
	    var that = this;

	    this.startTime = new Date().getTime();
	    this.time = new Date().getTime();
	    this.log('>> Server started');
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
		this.clients[ this.clientID ] = new Client( this, conn, false );

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

Client.prototype.sendMessage = function( msg ) {
	var encodedMessage = BISON.encode( msg );
	this.conn.send( encodedMessage );
};