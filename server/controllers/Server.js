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
var Class = require('../../client/js/lib/Class.js').Class;
var ServerGameController = require('../controllers/ServerGame.js').Class;
var ServerNetChannel = require('../network/ServerNetChannel.js').Class;
var Logger = require('../lib/Logger.js').Class;

(function(){
	exports.Class = Class.extend({
		init: function( config, serverConfig )
		{
			this._super();

			this.logger = new Logger( serverConfig, this );
			this.games = {};

			for( var i = 0; i < 1; i += 1 )
			{
				// create our game
				this.games[ i ] = new ServerGameController( this );

				// start the game
				this.games[ i ].start();
			}
		},

		getNextAvailablePort: function()
		{
			return this.serverConfig.port += 1;
		},

		log: function( o )
		{
			this.logger.log( o );
		}
	});
}());