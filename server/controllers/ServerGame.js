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

require('events');
require('../../client/js/controllers/AbstractGame.js');
require('../../client/js/lib/Joystick.js');
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

			this.fieldController.createPackedCircleManager();
			
			// Each time we create an entity we increment this
			this.nextEntityID = 1;

			// the Server has access to all the games and our logger
			// amongst other things that the entire server would need
			this.server = aServer;
			                          
			// Each ServerNetChannel is owned by a single ServerGameInstance
			this.netChannel = new ServerNetChannel(this, this.server.gameConfig);
		},

		/**
		 * Main loop
		 * Calls super.tick()
		 * Creates a WorldEntityDescription which it sends to NetChannel
		 */
		tick: function()
		{
			this.callSuper();

			this.fieldController.packedCircleManager.handleCollisions();
			
			// Create a new world-entity-description, could be some room for optimization here but it only happens once per game loop anyway
			var worldEntityDescription = new WorldEntityDescription( this );
			this.netChannel.tick( this.gameClock, worldEntityDescription );
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
		 * Calls super.shouldAddPlayer to create the character and attaches a Joystick to it
		 * @param anEntityID	An Entity ID for this Character, we created this right before this was called
		 * @param aClientID		Connection ID of the client
		 * @param playerType 	Playertype - ServerGame does not use this property
		 */
		shouldAddPlayer: function (anEntityID, aClientID, playerType)
		{
			var aNewCharacter = this.callSuper(anEntityID, aClientID, 'Character');
			if(aNewCharacter == null) return; // No character created for whatever reason. Room full?

			aNewCharacter.setInput( new Joystick() );
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
		 * TODO: zero out character health and projectiles etc
		 */
		start: function()
		{
			this.netChannel.start();
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
