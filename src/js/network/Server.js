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

define([ 'network/ws', 'lib/core.js', 'lib/SortedLookupTable', 'controllers/SnowGame', 'lib/Logger'], function( ws, JS, SortedLookupTable, SnowGame, Logger ) {
	var SERVERSTATS = {};

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
			this.games = new SortedLookupTable();

			this.initServerChooser( this.gameConfig.SERVER_SETTING.GAME_PORT );

			console.gameLog("(Server)::initialized Using\n\nServer Configuration:\n", SYS.inspect(this.gameConfig.SERVER_SETTING), "\n");
			console.gameLog("(Server) started and running...");

			// Running active connections on a ServerNetChannel
			SERVERSTATS.activeConnections = 0;
			SERVERSTATS.totalConnections = 0;
			// Total people who attempted to connect to ServerChooser
			SERVERSTATS.gameJoinRequest = 0;
			// Game info
			SERVERSTATS.activeGames = 0;
			SERVERSTATS.totalGamesPlayed = 0;

			// Listen for process termination
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
				console.log("(ServerChooser) client connected, [total gameJoinRequest: " + SERVERSTATS.gameJoinRequest + "]");
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
				connection.close();
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

			var existingGameAtDesiredPort = this.games.objectForKey(desiredPort );

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
			var firstMatch = 0;
			this.games.forEach(function(key, game)
			{
				if( firstMatch !== 0) return; // Already matched

				// Ask game if this player can join
				if( game.canAddPlayer() )
					firstMatch = game.portNumber;

			}, this);


			return firstMatch || this.createNewGame();
		},

		createNewGame: function()
		{
			return this.createGame( this.getNextAvailablePort() );
		},

		createGame: function( newPort )
		{
			this.gameConfig.SERVER_SETTING.NEXT_GAME_ID++;
			var aGameInstance = new SnowGame( this, newPort );
			aGameInstance.start(); // start the game

			var that = this;
			// Listen for when the game is over
			aGameInstance.eventEmitter.on(GAMECONFIG.EVENTS.ON_GAME_ENDED, function( anEndedGameInstance ) {
				that.killGame(anEndedGameInstance.portNumber);
			});

			this.games.setObjectForKey(aGameInstance, newPort);

			return newPort;
		},

		killGame: function( port )
		{
			console.log('(Server)::killGame KillingGame on port', port);
			this.games.remove(port);
		},

		getNextAvailablePort: function()
		{
			var nextPort = this.gameConfig.SERVER_SETTING.NEXT_PORT;

			while( this.games.objectForKey(nextPort) != null )
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
});