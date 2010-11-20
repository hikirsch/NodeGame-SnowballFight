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

var sys = require('sys');

require('../../client/js/lib/jsclass/core.js');
require('../../client/js/controllers/AbstractGame.js');
require('../network/ServerNetChannel.js');
require('../lib/Logger.js');

ServerGame = (function()
{
	return new JS.Class(AbstractGame, {
		initialize: function(aServer)
		{
			console.log('(ServerGame)::init');
			
			// the server controller has access to all the games and our logger
			// amongst other things that the entire server would need
			this.server = aServer;


			// ServerGameInstance - Each ServerNetChannel is owned by one ServerGameInstance
			this.netChannel = new ServerNetChannel(this, this.server.gameConfig);
		},

		onGenericCommand: function(clientID, aDecodedMessage)
		{
			this.CMD_TO_FUNCTION[aDecodedMessage.cmds.cmd].apply(this, [aDecodedMessage]);
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
			this.server.log(o);
		},

		status: function()
		{
			//this.logger.status();
		}
	});
})();
