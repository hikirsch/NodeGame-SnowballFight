var init = function()
{
	return Class.extend({
		init: function(options) 
		{
			console.log('(AbstractGameController) Instance created');
			var that = this;
			var desiredFramerate = 55;
			
			// Things in the game
			this.players = [];		// 
			this.projectiles = [];	// Things fired
			this.entities = [];		// Everything else, e.g. trees, rocks, powerups
			
			// Loop
			this.megaClockCounterThing = 0;
			this.gameClock = new Date().getTime();
			this.gameTick = setInterval(function(){that.tick()}, Math.ceil(1000/desiredFramerate));
		},
		
		tick: function()
		{
			this.gameClock = new Date().getTime();
		
			for(var aProjectile in this.projectiles) {
				aPlayer.tick(this.gameClock);
			};
				
			for(var aPlayer in this.players) {
				//aPlayer.tick(this.gameClock);
			};
			
			for(var anEntity in this.entities) {
				anEntity.tick(this.gameClock);
			};
			
			this.megaClockCounterThing++;
		//	 Tick the objects that are interested
		//	this.netChannel.tick(this.gameClock);
		},
		
		
		/**
		* Adding and removing players
		*/
		shouldAddNewClientWithID: function(aClientID)
		{
			console.log('Adding new client to ServerGameController with ID:' + aClientID);
			this.players[this.clientID] = new CharacterController(aClientID);
		}	
	});
}

if (typeof window === 'undefined') {
	var sys = require("sys");
	require('./tools/Class.js');
	exports.AbstractClassController = init();
} else {
	define(['tools/Class'], init);
}