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

var init = function( Vector, Rectangle, SortedLookupTable, FieldController, GameEntityFactory )
{
	return new JS.Class(
	{
		include: JS.StackTrace,
		
		initialize: function(config)
		{
			this.config = config;
			this.setModel(GAMECONFIG.GAME_MODEL);
			this.isGameOver = false;

			// our game takes place in a field
			this.fieldController = new FieldController( this, this.model );

			// This is the Factory that will create all the entities for us
			this.entityFactory = new GameEntityFactory(this.fieldController, config.ENTITY_MODEL);

			// intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
			// this.targetDelta, Milliseconds between frames 16ms means 60FPS - it's the framerate the game is designed against
			this.intervalFramerate = 60; // Try to call our tick function this often
			this.targetDelta = Math.floor( 1000/this.intervalFramerate );

			// Loop
			this.clockActualTime = new Date().getTime();
			this.gameClock = 0; // Our game clock is relative
			this.gameTick = 0;
		},

		startGameClock: function()
		{
			var that = this;
			this.gameTickInterval = setInterval(function(){that.tick()}, this.targetDelta);
		},

		stopGameClock: function()
		{
			clearInterval( this.gameTickInterval );
		},

		hasView: function()
		{
			return this.view != null;
		},

		// Please never clog abstract game value formating, allow objects to do that with the data returned
		getTimeRemaining: function()
		{
			return GAMECONFIG.GAME_MODEL.gameDuration - this.gameClock;
		},

		// NOTE: Please never format values here - allow objects to do that with the data returned
		getNumberOfPlayers: function()
		{
			return this.fieldController.players.count();
		},

		setModel: function(aGameModel)
		{
			this.model = aGameModel;

			if( this.fieldController )
			{
				this.fieldController.setModel(aGameModel);
			}
		},

		getModel: function()
		{
			return this.model;
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

			this.fieldController.tick(speedFactor, this.clockActualTime, this.gameTick)
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


		shouldAddPlayer: function (anObjectID, aClientID, aCharacterModel)
		{
			// TODO: Check if we can still add new players
			var aNewCharacter = this.fieldController.addPlayer( anObjectID, aClientID, aCharacterModel );
			return aNewCharacter;
		},

		removeEntity: function( objectID )
		{
			this.fieldController.removeEntity( objectID );
		},

		log: function(o)
		{
			console.log(o);
		},

		/**
		 * ACCESSORS
		 */
		getWidth: function()
		{
			return this.fieldController.getWidth();
		},

		getHeight: function()
		{
			return this.fieldController.getHeight();
		},

		getFieldLeft: function()
		{
			return this.fieldController.getLeft();
		},

		getFieldTop: function()
		{
			return this.fieldController.getTop();
		},

		isGameActive: function()
		{
			return (this.gameClock < this.model.gameDuration);
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
	require('../lib/jsclass/core.js');
	require('js/controllers/entities/traits/BaseTrait.js');

	AbstractGame = init( Vector, Rectangle, SortedLookupTable, FieldController, GameEntityFactory);
}
else 
{
	define(['lib/Vector',
		'lib/Rectangle',
		'lib/SortedLookupTable',
		'controllers/FieldController',
		'factories/GameEntityFactory',
		'lib/jsclass/core'], init);
}