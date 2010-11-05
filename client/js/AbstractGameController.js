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
var init = function(CharacterController, Rectangle)
{
	return Class.extend({
		init: function(options) 
		{
			var that = this;
			var desiredFramerate = 55;
			
			this.fieldRect = new Rectangle(0, 0, 640, 480);
			
			// Things in the game
			this.players = {};		// 
			this.projectiles = {};	// Things fired
			this.entities = {};		// Everything else, e.g. trees, rocks, powerups, dogs, cats
			
			// Loop
			this.megaClockCounterThing = 0;
			this.gameClock = new Date().getTime();
			this.gameTick = setInterval(function(){that.tick()}, Math.ceil(1000/desiredFramerate));
		},
		
		/**
		 * Tick tock, the clock is running! Make everyone do stuff.
		 */
		tick: function()
		{
			this.gameClock = new Date().getTime();
			
			var aProjectile;
			for(var key in this.projectiles) {
				aProjectile = this.projectiles[key];
				aProjectile.tick(this.gameClock);
			};
				
			var aPlayer;
			for(var key in this.players) {
				aPlayer = this.players[key];
				aPlayer.tick(this.gameClock);
				
				if(aPlayer != this['clientCharacter'])
					console.log(aPlayer.velocity.x, aPlayer.velocity.y);
			};
			
			var anEntity;
			for(var key in this.entities) {
				anEntity = this.entities[key];
				anEntity.tick(this.gameClock);
			};
		},
		 
		/**
		* Adding and removing players
		*/
		shouldAddNewClientWithID: function(aClientID)
		{
			var newCharacter = new CharacterController(aClientID, this.fieldRect);
			this.players[aClientID] = newCharacter;
			
//			console.log('(AbstractGameController) adding player:' + aClientID, newCharacter);
			return newCharacter;
		},
		
		/**
		*	Events from other players
		*/
		onPlayerMoved: function(messageData)
		{
			var targetCharacter = this.players[messageData.id];
			var data = messageData.cmds.data;
			
			if(targetCharacter == null) return;
			
//			if(sys)
//				console.log('v', sys.inspect(messageData));
			
			targetCharacter.position.x = data.x;
			targetCharacter.position.y = data.y;
			targetCharacter.velocity.x = data.vx;
			targetCharacter.velocity.y = data.vy;
			//console.log('(AbstractGameController) playerMove:', messageData.cmds.data, this.clientCharacter.position);
		},
	});
}

if (typeof window === 'undefined') {
	var CharacterController  = require('./CharacterController.js').Class;
	var Rectangle = require('./CharacterController.js').Class;
	var COMMANDS = require('./config.js').COMMANDS;
	var sys = require('sys');
	exports.Class= init(CharacterController, Rectangle);
} else {
	define(['CharacterController', 'lib/Rectangle'], init);
}