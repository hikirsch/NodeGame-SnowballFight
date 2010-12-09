/**
File:
	Logger.js
Created By:
	Adam Kirsch
Project:
	Ogilvy Holiday Card 2010
Abstract:
	This class creates a persistent logger with a backlog of messages
	Currently it can only be used by the ServerNetChannel class since it references it directly
Basic Usage: 
	
Version:
	1.0
*/

var sys = require('sys');
var BISON = require('js/lib/bison');

Logger = (function()
{
	return new JS.Class(
	{
		initialize: function( options, game)
		{
			this.options = options || {};
			this.game = game || null;
			this.netChannel = game.netChannel;

			// Keep a rolling count of KB/Sec
			this.perSecondTick = 0;
			this.lastSent = 0;
			this.perSecond = 0;

			this.logs = [];
		},
		
		push: function( anObject )
		{
			this.logs.push(anObject);
		},
		
		/**
		 * Helper Methods for Logging
		 */
		getTime: function()
		{
			return this.options.time;
		},
	
		timeDiff: function( time )
		{
			return this.options.time - time;
		},
	
		log: function( str )
		{
			this.logs.push([this.game.gameClock, str]);
			
			if(this.logs.length > 20)
				this.logs.shift();
		},

		toSize: function( size ) {
			var t = 0;
			
			while(size >= 1024 && t < 2)
			{
				size = size / 1024;
				t++;
			}
			
			return Math.round(size * 100) / 100 + [' bytes', ' kib', ' mib'][t];
		},
	
		toTime: function( time )
		{
			var t = Math.round( ( time - this.game.netChannel.startTime ) / 1000);
			var m = Math.floor( t / 60 );
			var s = t % 60;
			return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
		},
	
		tick: function( end )
		{
			
			var that = this;
			if( !this.options.showStatus ) { return; }

			// Update this.perSecond
			if( (this.game.gameClock - this.perSecondTick) > 1000)
			{
				this.perSecondTick = this.game.gameClock;
				this.perSecond = this.game.netChannel.bytes.sent - this.lastSent;
				this.lastSent = this.game.netChannel.bytes.sent;
			}

			// Log statistics
		    var stats = '    Running ' + this.toTime( this.game.gameClock ) + ' | '
						+ this.game.netChannel.clientCount + ' Client(s) | '
						+ this.game.fieldController.players.count() + ' Players(s) | '
						+ this.game.fieldController.allEntities.count() + ' Entities(s) | '
						+ this.toSize( this.game.netChannel.bytes.sent ) + ' sent | '
						+ this.toSize( this.game.netChannel.bytes.received ) + ' received | '
						+ this.toSize( this.perSecond ) + '/sec';



			// Show latest rolling log messages
			var len = this.logs.length;
			while(len--) {
				 stats += '\n      ' + this.toTime(this.logs[len][0]) + ' ' + this.logs[len][1];
			}

			console.log('\x1b[H\x1b[J# NodeGame Server at port ' + this.netChannel.port + '\n' + stats + '\n\x1b[s\x1b[H');
		}
	});
})();
