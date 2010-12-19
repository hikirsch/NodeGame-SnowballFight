/**
File:
	SnowGame.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	This is the GameController that is specific to OgilvyHolidayGame 2010
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

require('events');
require('js/controllers/AbstractGame');
require('js/lib/Joystick');
require('js/factories/GameEntityFactory');
require('js/model/FieldEntityModel');
require('network/ServerNetChannel');
require('model/WorldEntityDescription');
require('lib/Logger');

AbstractServerGame = (function()
{
	return new JS.Class(AbstractGame, {
		initialize: function(aServer, portNumber)
		{
			this.callSuper();
			console.log('(ServerGame)::init');

			// the Server has access to all the games and our logger
			// amongst other things that the entire server would need
			this.server = aServer;
			this.nextEntityID = 1; 	// Each time we create an entity we increment this
			this.gameID = this.server.gameConfig.SERVER_SETTING.NEXT_GAME_ID;

			// Make our rolling log globally accessible
			var that = this;
			console.gameLog = function () {
				var len = arguments.length;
				while(len--)
					that.log(arguments[len]);
			};

			this.portNumber = portNumber;
			this.fieldController.createPackedCircleManager();

			// Each ServerNetChannel is owned by a single ServerGameInstance
			this.netChannel = new ServerNetChannel(this, this.server.gameConfig, portNumber);

			this.logger = new Logger({time: this.gameClock, showStatus: false }, this);

			this.startGameClock();
		},

		/**
		 * Main loop
		 * Calls super.tick()
		 * Creates a WorldEntityDescription which it sends to NetChannel
		 */
		tick: function()
		{
			this.callSuper();

			this.fieldController.packedCircleManager.forceCirclesToMatchViewPositions();
			this.fieldController.packedCircleManager.handleCollisions();

			// Create a new world-entity-description, could be some room for optimization here but it only happens once per game loop anyway
			var worldEntityDescription = new WorldEntityDescription( this );

			this.netChannel.tick( this.gameClock, worldEntityDescription );

			this.logger.tick();

			if( this.gameClock > this.model.gameDuration)
			{
				this.shouldEndGame();
			}
		},

		/**
		 * A generic client command has been received.
		 * @param clientID
		 * @param aDecodedMessage
		 */
		onGenericCommand: function(clientID, aDecodedMessage)
		{
			this.CMD_TO_FUNCTION[aDecodedMessage.cmds.cmd].apply(this, [aDecodedMessage]);
		},

		/**
		 * A client has sent input inside of a message.
		 * Grab the cmdData from the message, and the player via cmdData.objectID
		 * Send the input bitmask to the playerEntity
		 * @param clientID
		 * @param aDecodedMessage
		 */
		onPlayerMoveCommand: function(clientID, aDecodedMessage)
		{
			var cmdData = aDecodedMessage.cmds.data;
			var playerEntity = this.fieldController.allEntities.objectForKey(cmdData.objectID);
			playerEntity.input.deconstructInputBitmask( cmdData.input );
		},

		/**
		 * Called when the gameClock has passed model.gameDuration
		 */
		shouldEndGame: function()
		{
			var nextGamePort = this.server.getNextAvailablePort();

			this.gameOver = true;
			this.stopGameClock();

			// Create a message to send to all clients
			var endGameMessage = {
				seq: 1,
				gameClock: this.gameClock,
				cmds: {
					cmd: this.server.gameConfig.CMDS.SERVER_END_GAME,
					data: { nextGamePort: nextGamePort }
				}
			};

			this.netChannel.broadcastMessage(endGameMessage);
			this.dealloc();
		},

		dealloc: function()
		{
			this.netChannel.dealloc();
			this.fieldController.dealloc();
			this.server.killGame( this.portNumber );
		},

		/**
		 * Calls super.shouldAddPlayer to create the character and attaches a Joystick to it
		 * @param anEntityID	An Entity ID for this Character, we created this right before this was called
		 * @param aClientID		Connection ID of the client
		 * @param aCharacterModel 	A character model
		 */
		shouldAddPlayer: function (anEntityID, aClientID, aCharacterModel)
		{
			var aNewCharacter = this.callSuper();
			if(aNewCharacter == null) return; // No character created for whatever reason. Room full?

			aNewCharacter.setInput( new Joystick() );
			aNewCharacter.position = this.fieldController.positionEntityAtRandomNonOverlappingLocation(20);
			return aNewCharacter;
		},

		/**
		 * Remove a player from the game via their ConnectionID
		 * @param connectionID
		 */
		removePlayer: function (connectionID)
		{
			this.fieldController.removePlayer( connectionID );
		},

		/**
		 * Start the netChannel and start the game.
		 */
		start: function()
		{
			this.netChannel.start();
		},

		log: function(aMessage)
		{
			if(this.logger.options.showStatus)
				this.logger.log(aMessage);
			else
				console.log(aMessage);
		},

		/**
		 * Internal game events
		 */
		/**
		 * Accessors
		 */
		getNextEntityID: function()
		{
			return this.nextEntityID++;
		}
	});
})();
