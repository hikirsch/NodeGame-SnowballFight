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

var init = function()
{
	return new JS.Class(
	{
		initialize: function( gameConfig, serverConfig )
		{
			this.logger = new Logger( serverConfig, this );
			this.gameConfig = gameConfig;
			this.serverConfig = serverConfig;

			var loggerOptions = {};
			this.logger = new Logger( loggerOptions, this );
			this.games = {};

			for( var i = 0; i < 1; i += 1 )
			{
				// create our game
				var aGameInstance = new ServerGame( this );
				// start the game
				aGameInstance.start();
				this.games[ i ] = aGameInstance;
			}
		},

		getNextAvailablePort: function()
		{
			return this.serverConfig.port += 1;
		},

		log: function( o )
		{
			this.logger.log( o );
		} // Close prototype object
	}); // Close .extend
}; // close init()


require('js/lib/jsclass/core.js');
require('controllers/ServerGame.js');
require('network/ServerNetChannel.js');
require('lib/Logger.js');
Server = init();