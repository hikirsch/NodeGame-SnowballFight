var sys = require('sys');
var fs= require('fs');

var ws = require('./ws');
var BISON = require('./bison');

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
	this.$ = new ws.Server();
	
	this.$.onConnect = function( conn ) {
		
    };

    this.$.onMessage = function( conn, msg ) {
    	if (msg.length > that.maxChars) {
            that.log('!! Message longer than ' + that.maxChars + ' chars');
            conn.close();
        
        } else {
            try {
                var msg = BISON.decode(msg);
                if (!conn.$clientID && msg instanceof Array && msg.length === 1
                    && msg[0] === 'init') {
                    
                    conn.$clientID = that.addClient(conn);
                
                } else {
                    that.clients[conn.$clientID].onMessage(msg);
                }
            
            } catch (e) {
                that.log('!! Error: ' + e);
                conn.close();
            }
        }
    }
    
    this.$.onClose = function(conn) {     
        that.removeClient(conn.$clientID);
    };
    
    // Hey Listen!
    this.$.listen(this.port);
}

Server.prototype = {
	run: function() {
	    var that = this;
	    process.nextTick(function() {
	        that.start();
	    });
	},

	start: function() {
	    var that = this;
	    /*
	    for(var i in this.actorTypes) {
	        this.actors[i] = [];
	    }
	    */
	    this.startTime = new Date().getTime();
	    this.time = new Date().getTime();
	    this.log('>> Server started');
	    // this.$$.start();
	    this.status();
	    
	    if (this.record) {
	        this.clientID++;
	        this.clients[0] = new Client(this, null, true);
	        this.clientCount++;
	    }
	    process.addListener('SIGINT', function(){that.shutdown()});
	},

	shutdown: function() {
	    this.$$.$running = false;
	    this.emit(MSG_GAME_SHUTDOWN, this.$$.onShutdown());
	    this.destroyActors();
	    
	    var that = this;
	    setTimeout(function() {
	        for(var c in that.clients) {
	            that.clients[c].close();
	        }
	        that.saveRecording();
	        that.log('>> Shutting down...');
	        that.status(true);
	        process.exit(0);
	    }, 100);
	},
	
	removeClient: function( clientId ) {
	
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