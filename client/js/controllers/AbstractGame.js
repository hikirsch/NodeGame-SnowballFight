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
var init = function(CharacterController, FieldController, Rectangle, Vector, SortedLookupTable)
{
	return Class.extend({
		init: function() 
		{ 
			// our game takes place in a field
			this.field = new FieldController(this);
			
			// intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
			// desiredFramerate, is usually 60 or 30 - it's the framerate the game is designed against 
			
			this.intervalFramerate = 60; // Try to call our tick function this often
			this.desiredFramerate = 60;
			
			// Loop
			this.gameClock = new Date().getTime();
			this.gameTick = setInterval( this.tick.bind( this ) , 1000 / this.intervalFramerate );
		},
		
		/**
		 * Tick tock, the clock is running! Make everyone do stuff.
		 */
		tick: function()
		{
			var oldTime = this.gameClock;
			this.gameClock = new Date().getTime();
			var delta = ( this.gameClock - oldTime ); // Note (var framerate = 1000/delta);
			
			// Framerate independent motion
			// Any movement should take this value into account, 
			// otherwise faster machines which can update themselves more accurately will have an advantage
			var speedFactor = delta / ( 1000 / this.desiredFramerate );
			if (speedFactor <= 0) speedfactor = 1;

			this.field.tick(speedFactor);
		},
		
		/**
		* Adding and removing players
		*/
		addClient: function( aClientID, nickName, initView )
		{
			var newCharacter = new CharacterController( aClientID, this.field, initView );
			newCharacter.setNickName( nickName );
			
			this.field.addPlayer( newCharacter );
			
			return newCharacter;
		},
		
		setNickNameForClientID: function(aNickName, aClientID) 
		{
			this.log( '(AbstractGame) setting client nickname to: ' + aNickName + ' for clientID: ' + aClientID );
			this.field.players.objectForKey(aClientID).setNickName(aNickName);
		},
		
		/**
		 * Events from other players
		 */
		onPlayerMoved: function(data)
		{
			var targetCharacter = this.players.get(messageData.id);
			
			if(targetCharacter == null) 
			{
				console.log('(AbstractGameController#onPlayerMoved) - targetPlayer not found! Ignoring...\nMessageData:', (sys) ? sys.inspect(messageData) : data );
				return;
			};
			
			targetCharacter.serverPosition.x = data.x;
			targetCharacter.serverPosition.y = data.y;
			
			if (Math.abs(targetCharacter.position.x - data.x) > 0.01 || Math.abs(targetCharacter.position.y - targetCharacter.serverPosition.y) > 0.01)
			{
				var difference = new Vector(targetCharacter.serverPosition.x-targetCharacter.position.x, targetCharacter.serverPosition.y-targetCharacter.position.y);
				difference.mul(0.1);
				
				targetCharacter.position.add(difference);
			}

			targetCharacter.velocity.x = data.vx;
			targetCharacter.velocity.y = data.vy;
		}
	});
};

if (typeof window === 'undefined') 
{
	var CharacterController = require('./Character.js').Class;
	var FieldController = require('./Field.js').Class;
	var Rectangle = require('../lib/Rectangle.js').Class;
	var Vector = require('../lib/Vector.js').Class;
	var SortedLookupTable = require('../lib/SortedLookupTable.js').Class;
	
	exports.Class = init( CharacterController, FieldController, Rectangle, Vector, SortedLookupTable );
} 
else 
{
	define(['controllers/Character', 'controllers/Field', 'lib/Rectangle', 'lib/Vector', 'lib/SortedLookupTable' ], init);
}