
/**
File:
	AbstractGameController
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This is the most basic version of the GameController.
	It keeps track of the gameclock, and tells its objects to update
	It is subclassed by ServerGameController and ClientGameController.
Basic Usage: 
	 See subclasses
*/

var init = function( Vector, Rectangle, SortedLookupTable, FieldController, GameEntityFactory, GameEntity, Character, ClientControlledCharacter)
{
	return new JS.Class(
	{
		include: JS.StackTrace,
		
		initialize: function(config)
		{
			this.config = config;

			// our game takes place in a field
			this.fieldController = new FieldController( this );
			this.fieldController.tick();

			// This is the Factory that will create all the entities for us
			this.entityFactory = new GameEntityFactory(this.fieldController);

			// intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
			// this.targetDelta, Milliseconds between frames 16ms means 60FPS - it's the framerate the game is designed against
			this.intervalFramerate = 60; // Try to call our tick function this often
			this.targetDelta = Math.floor( 1000/this.intervalFramerate );

			// Loop
			this.clockActualTime = new Date().getTime();
			this.gameClock = 0;									// Our game clock is relative
			this.gameTick = 0;
			
			var that = this; // Temporarily got rid of bind (had some bug with it), feel free to add back in -
			this.gameTickInterval = setInterval(function(){that.tick()}, this.targetDelta);
		},
		
		/**
		 * Tick tock, the clock is running! Make everyone do stuff.
		 */
		tick: function()
		{
			// Store the previous clockTime, then set it to whatever it is no, and compare time
			var oldTime = this.clockActualTime;
			var now = this.clockActualTime = new Date().getTime();
			var delta = ( now - oldTime );			// Note (var framerate = 1000/delta);

			// Our clock is zero based, so if for example it says 10,000 - that means the game started 10 seconds ago 
			this.gameClock += delta;
			this.gameTick++;
			
			// Framerate independent motion
			// Any movement should take this value into account,
			// otherwise faster machines which can update themselves more accurately will have an advantage
			var speedFactor = delta / ( this.targetDelta );
			if (speedFactor <= 0) speedFactor = 1;

			this.fieldController.tick(speedFactor, this.clockActualTime);
		},
		
		/**
		* Adding and removing players
		*/
		addClient: function( aClientID, nickName )
		{

		},
		
		setNickNameForClientID: function(aNickName, aClientID) 
		{
			this.log( '(AbstractGame) setting client nickname to: ' + aNickName + ' for clientID: ' + aClientID );
			this.fieldController.players.objectForKey(aClientID).setNickName(aNickName);
		},


		shouldAddPlayer: function (anObjectID, aClientID, playerType)
		{
			// TODO: Check if we can still add new players
			var aNewCharacter = this.fieldController.addPlayer( anObjectID, aClientID, playerType );
			return aNewCharacter;
		},

		removeEntity: function( objectID )
		{
			this.fieldController.removeEntity( objectID );
		}
	});
};

if (typeof window === 'undefined') 
{
	require('../lib/Vector.js');
	require('../lib/Rectangle.js');
	require('../lib/SortedLookupTable.js');
	require('./FieldController.js');
	require('../factories/GameEntityFactory');
	require('./entities/GameEntity');
	require('./entities/Character');
	require('./entities/ClientControlledCharacter');
	require('../lib/jsclass/core.js');
	var sys = require("sys");
	AbstractGame = init( Vector, Rectangle, SortedLookupTable, FieldController, GameEntityFactory, GameEntity, Character, ClientControlledCharacter);
}
else 
{
	define(['lib/Vector',
		'lib/Rectangle',
		'lib/SortedLookupTable',
		'controllers/FieldController',
		'factories/GameEntityFactory',
		'controllers/entities/GameEntity',
		'controllers/entities/Character',
		'controllers/entities/ClientControlledCharacter',
		'lib/jsclass/core'], init);
}