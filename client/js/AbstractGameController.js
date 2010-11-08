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
var init = function(CharacterController, Rectangle, Vector)
{
	return Class.extend({
		init: function(options) 
		{
			var that = this;
			this.fieldRect = new Rectangle(0, 0, 640, 480);
			/**
			* intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
			* desiredFramerate, is usually 60 or 30 - it's the framerate the game is designed against 
			*/
			this.intervalFramerate = 60;	// Try to call our tick function this often
			this.desiredFramerate = 60;		
			
			// Things in the game
			this.players = new SortedLookupTable();			// Active players
			this.projectiles = new SortedLookupTable();		// Things fired
			this.entities = new SortedLookupTable();		// Everything else, e.g. trees, rocks, powerups, dogs, cats
			
			// Loop
			this.gameClock = new Date().getTime();
			this.gameTick = setInterval(function(){that.tick()}, 1000/this.intervalFramerate);
		},
		
		/**
		 * Tick tock, the clock is running! Make everyone do stuff.
		 */
		tick: function()
		{
			var oldTime = this.gameClock;
			this.gameClock = new Date().getTime();
			var delta = (this.gameClock - oldTime); // Note (var framerate = 1000/delta);
			
//			console.log('Num players:'+this.players.count());
			
			// Framerate independent motion
			// Any movement should take this value into account, 
			// otherwise faster machines which can update themselves more accurately will have an advantage
			var speedFactor = delta / (1000/this.desiredFramerate);
			if (speedFactor <= 0) speedfactor = 1;

			// Update players
			this.players.forEach(function(key, player){ 
				player.tick(speedFactor)
			}, this);
			
			// Update projectiles
			this.projectiles.forEach(function(key, projectile){ 
				projectile.tick(speedFactor)
			}, this);
			
			// Update entities
			this.entities.forEach(function(key, entity){ 
				entity.tick(speedFactor)
			}, this);
		},
		 
		/**
		* Adding and removing players
		*/
		addNewClientWithID: function(aClientID)
		{
			var newCharacter = new CharacterController(aClientID, this.fieldRect);
			this.players.setObjectForKey(newCharacter, aClientID);
			
			return newCharacter;
		},
		
		/**
		*	Events from other players
		*/
		onPlayerMoved: function(messageData)
		{
			var targetCharacter = this.players._data[messageData.id];
			var data = messageData.cmds.data;
			
			if(targetCharacter == null) 
			{
				console.log('(AbstractGameController#onPlayerMoved) - targetPlayer not found! Ignoring...\nMessageData:', (sys) ? sys.inspect(messageData) : data );
				return;
			};
			
			
			
			targetCharacter.serverPosition.x = data.x;
			targetCharacter.serverPosition.y = data.y;
			console.log(targetCharacter.serverPosition.x,targetCharacter.serverPosition.y);
			if (Math.abs(targetCharacter.position.x - data.x) > 0.01 || Math.abs(targetCharacter.position.y - targetCharacter.serverPosition.y) > 0.01)
			{
				var difference = new Vector(targetCharacter.serverPosition.x-targetCharacter.position.x, targetCharacter.serverPosition.y-targetCharacter.position.y);
				difference.mul(0.1);
				
			 	targetCharacter.position.add(difference);
			}
			
			
//			if(sys)
//				console.log('v', sys.inspect(messageData));
	
//			console.log('b',targetCharacter.velocity.x);		

			targetCharacter.velocity.x = data.vx;
			targetCharacter.velocity.y = data.vy;
			//console.log('(AbstractGameController) playerMove:', messageData.cmds.data, this.clientCharacter.position);
		}
	});
}

if (typeof window === 'undefined') {
	var CharacterController  = require('./CharacterController.js').Class;
	var Rectangle = require('./CharacterController.js').Class;
	var Vector = require('./lib/Vector.js').Class
	var COMMANDS = require('./config.js').COMMANDS;
	var sys = require('sys');
	require('./lib/SortedLookupTable.js');
	
	exports.Class= init(CharacterController, Rectangle, Vector);
} else {
	define(['CharacterController', 'lib/Rectangle', 'lib/Vector', 'lib/SortedLookupTable'], init);
}