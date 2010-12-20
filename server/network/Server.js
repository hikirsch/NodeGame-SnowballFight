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


var ws = require('network/ws.js');
require('js/lib/jsclass/core.js');
require('controllers/SnowGame.js');
require('lib/Logger.js');

Server = (function()
{
	return new JS.Class(
	{
		initialize: function( gameConfig, serverConfig )
		{
			this.gameID = 1;
			this.logger = new Logger( serverConfig, this );
			this.gameConfig = gameConfig;
			this.serverConfig = serverConfig;

			console.log("(Server) GAMECONFIG", SYS.inspect(this.gameConfig.SERVER_SETTING), serverConfig)

			this.gameConfig.SERVER_SETTING.NEXT_PORT = this.gameConfig.SERVER_SETTING.GAME_PORT + 1;

//			console.log("(Server) GAMECONFIG", SYS.inspect(this.gameConfig.SERVER_SETTING), serverConfig)

			var loggerOptions = {};
			this.logger = new Logger( loggerOptions, this );
			this.games = {};

			this.initServerChooser( this.gameConfig.SERVER_SETTING.GAME_PORT );
		},

		initServerChooser: function( port ) {
			var that = this,
				aWebSocket = this.$ = new ws.Server(null),
				clientID = 0;

			// client will ask for a game in on message
			aWebSocket.onConnect = function(connection) {
				console.log("(Server) connected!");
				connection.__CONNECTED = true;
			};

			aWebSocket.onMessage = function(connection, encodedMessage )
			{
				clientID++;
				connection.$clientID = clientID;
				var decodedMessage = BISON.decode( encodedMessage ),
					actualPort = that.getGameWithDesiredPort( decodedMessage.desiredPort ),
					newGame = { 'actualPort': actualPort },
					newEncodedMessage = BISON.encode(newGame);
			  	console.log("(Server) player should join: " + actualPort );
				connection.send( newEncodedMessage );
			};

			aWebSocket.onClose = function(connection) {
				connection.doClose(); // this should work but causes recursive loop
			};

			aWebSocket.listen( port );
		},

		getGameWithDesiredPort: function( desiredPort )
		{

			var isValidPort = desiredPort != this.gameConfig.SERVER_SETTING.GAME_PORT &&
                desiredPort > this.gameConfig.SERVER_SETTING.GAME_PORT &&
                desiredPort < this.gameConfig.SERVER_SETTING.GAME_PORT + this.gameConfig.SERVER_SETTING.MAX_PORTS;

			// Port is not within range - ignore requested and send to a new port defined by us
			if(!isValidPort) {
				return this.getNextAvailableGame();
			}

			var existingGameAtDesiredPort = this.games[ desiredPort ];

			// Game exist
			if(existingGameAtDesiredPort)
			{
				// If the game says its ok, allow them to connect
				if(existingGameAtDesiredPort.canAddPlayer()) {
					console.log("(Server) Allowing player to connect to'" + desiredPort + "'...");
					return desiredPort;
				} else { // Game is full or over, send them to another game
					console.log("(Server) blocking player from joining '" + desiredPort + "', sending player to different game...");
					return this.getNextAvailableGame();
				}
			}
			else // No game at that port - make a new game at the next available port
			{
				console.log("(Server) No game found at '" + desiredPort + "', creating new game instance...");
				return this.createGame( desiredPort );
			}
		},

		getNextAvailableGame: function()
		{
			for( var gamePort in this.games )
			{
				if( this.games.hasOwnProperty( gamePort  ) ) {
					if( gamePort in this.games && this.games[ gamePort ] != null
						&& this.games[gamePort].canAddPlayer() ) {
						return gamePort;
					}
				}
			}

			return this.createNewGame();
		},

		createNewGame: function()
		{
			return this.createGame( this.getNextAvailablePort() );
		},

		createGame: function( newPort )
		{
			this.gameConfig.SERVER_SETTING.NEXT_GAME_ID++;
			var aGameInstance = new SnowGame( this, newPort );
			// start the game
			aGameInstance.start();
			this.games[ newPort ] = aGameInstance;

			return newPort;
		},

		killGame: function( port )
		{
			this.games[ port ] = null;
		},

		getNextAvailablePort: function()
		{
			var nextPort = this.gameConfig.SERVER_SETTING.NEXT_PORT;

			while( this.games[ nextPort ] != null )
			{
				nextPort += 1;
				if( nextPort > this.gameConfig.SERVER_SETTING.GAME_PORT + this.gameConfig.SERVER_SETTING.MAX_PORTS ) {
					nextPort = this.gameConfig.SERVER_SETTING.GAME_PORT + 1;
				}
			}

			this.gameConfig.SERVER_SETTING.NEXT_PORT = nextPort;
			return this.gameConfig.SERVER_SETTING.NEXT_PORT ;
		},

		log: function( o )
		{
			this.logger.log( o );
		} // Close prototype object
	}); // Close .extend
})(); // close init()