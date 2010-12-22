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

SERVERSTATS = {};
Server = (function()
{
	return new JS.Class(
	{
		initialize: function( gameConfig, serverConfig )
		{
			this.gameID = 1;
			this.gameConfig = gameConfig;
			this.serverConfig = serverConfig;

			// Make our rolling log globally accessible
			var that = this;
			console.gameLog = function () {
				var len = arguments.length;
				while(len--)
					that.log(arguments[len]);
			};


			this.gameConfig.SERVER_SETTING.NEXT_PORT = this.gameConfig.SERVER_SETTING.GAME_PORT + 1;

		    this.logger = new Logger({time: this.gameClock, showStatus: false }, this);
			this.games = {};

			this.initServerChooser( this.gameConfig.SERVER_SETTING.GAME_PORT );

			console.gameLog("(Server)::initialized Using\n\nServer Configuration:\n", SYS.inspect(this.gameConfig.SERVER_SETTING), "\n")
			console.gameLog("(Server) started and running...");

			// Running active connections on a ServerNetChannel
			SERVERSTATS.activeConnections = 0;
			SERVERSTATS.totalConnections = 0;
			// Total people who attempted to connect to ServerChooser
			SERVERSTATS.gameJoinRequest = 0;
			// Game info
			SERVERSTATS.activeGames = 0;
			SERVERSTATS.totalGamesPlayed = 0;

//			// Listen for process termination
			var that = this;
			process.addListener('SIGINT', function(){
				that.log("(Server) Shutting Down");
				process.exit(0);
			});
		},

		initServerChooser: function( port ) {
			var that = this,
				aWebSocket = this.$ = new ws.Server(null),
				clientID = 0;

			// client will ask for a game in onMessage
			aWebSocket.onConnect = function(connection) {
				SERVERSTATS.gameJoinRequest++;
				console.log("(ServerChooser) client connected, [ clients: " + SERVERSTATS.gameJoinRequest + "]");
				connection.__CONNECTED = true;
			};

			aWebSocket.onMessage = function(connection, encodedMessage )
			{
				clientID++;
				connection.$clientID = clientID;

				var decodedMessage = BISON.decode( encodedMessage ),
					actualPort = that.getGameWithDesiredPort( decodedMessage.desiredPort ),
					gameInfoMessage = {'actualPort': actualPort};

			  	console.gameLog("(ServerChooser) Routing player to: " + actualPort );
				connection.send( BISON.encode(gameInfoMessage) );
			};

			aWebSocket.onClose = function(connection) {
//				connection.doClose(); // this should work but causes recursive loop
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

		log: function(msg)
		{
			this.logger.log(msg);
		}

		// Close prototype object
	}); // Close .extend
})(); // close init()