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

require('../../client/js/controllers/AbstractGame.js');
require('../network/ServerNetChannel.js');
require('../model/WorldEntityDescription.js');
require('../lib/Logger.js');

ServerGame = (function()
{
	return new JS.Class(AbstractGame, {
		initialize: function(aServer)
		{
			this.callSuper();
			console.log('(ServerGame)::init');

			// Each time we create an entity we increment this
			this.nextEntityID = 1;

			// the Server has access to all the games and our logger
			// amongst other things that the entire server would need
			this.server = aServer;
			                          
			// Each ServerNetChannel is owned by a single ServerGameInstance
			this.netChannel = new ServerNetChannel(this, this.server.gameConfig);
		},

		onGenericCommand: function(clientID, aDecodedMessage)
		{
			this.CMD_TO_FUNCTION[aDecodedMessage.cmds.cmd].apply(this, [aDecodedMessage]);
		},


		shouldAddPlayer: function (anEntityID, aClientID, playerType)
		{
			// Server ALWAYS creates 'Character' - but clients may create ClientControlledCharacter
			this.callSuper(anEntityID, aClientID, 'Character');
		},

		// start our game
		start: function()
		{
			this.netChannel.start();
		},

		tick: function()
		{
			this.callSuper();

			var worldEntityDescription = new WorldEntityDescription( this );
			this.netChannel.tick( this.clockGame, worldEntityDescription );
		},

		log: function(o)
		{
			// console.log( o );
			this.server.log(o);
		},

		status: function()
		{
			//this.logger.status();
		},

		/**
		 * Accessors
		 */
		getNextEntityID: function()
		{
			return this.nextEntityID++;
		}
	});
})();
