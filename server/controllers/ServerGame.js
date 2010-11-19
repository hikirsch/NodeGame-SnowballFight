/**
File:
	ServerGameController.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	This class is incharge of the actual game, it is aware of all the players / objects that currently exist.
	The servers version of the game, 'checks' all clients movements and internally handles collisions and informs clients
Basic Usage: 
	var gameController = new ServerGameController({
	    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
	    'status': false,
	    'recordFile': './../record[date].js',
	    'record': false,
	    'server': null
	});
	gameController.run();
	
Version:
	1.0
*/
var AbstractGameController = require('../../client/js/controllers/AbstractGame.js').Class;
var ServerNetChannel = require('../network/ServerNetChannel.js').Class;
var Logger = require('../lib/Logger.js').Class;

(function(){
	exports.Class = AbstractGameController.extend({
		init: function( serverController )
		{
			this._super();

			// the server controller has access to all the games and our logger
			// amongst other things that the entire server would need
			this.controller = serverController;

			// Server, the net channel should only care about this controller as well as the
			// port that it shuold run as, ask our main controller which port to use
			this.netChannel = new ServerNetChannel( this, this.controller.getNextAvailablePort() );
		},
		
		onGenericCommand: function(clientID, aDecodedMessage)
		{
			this.COMMAND_TO_FUNCTION[aDecodedMessage.cmds.cmd].apply(this,[aDecodedMessage]);
		},

		// start our game;
		start: function()
		{
			this.netChannel.start();
		},
		
		tick: function()
		{
			this._super();
		},
		
		log: function(o)
		{
			// console.log( o );
			this.controller.log( o );
		},
		
		status: function()
		{
			// this.logger.status();
		}
	});
}());