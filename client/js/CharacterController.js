var init = function()
{
	console.log(arguments);
	return Class.extend({
		init: function(aClientID) 
		{
			// some defaults we use
			this.velocity = new Vector(0,0); // how fast i am going
			this.acceleration = new Vector(0.1, 0.1); // how much i accelerate per tick
			this.damping = new Vector(0.33,0.33); // how much of a slide there is, how much do i take away per frame if there's no positive movement
			this.maxVelocity = new Vector(2.5, 2.5);  // the fastest i can go
			this.rotation = 0; // we start pointing up, simply easy b/c of sprites right now
			this.clientID = aClientID;
		}	
	});
}

if (typeof window === 'undefined') {
	// We're in node!
	var sys = require("sys");
	var Vector = require('./lib/Vector').Class;
	exports.Class = init();
} else {
	// We're on the browser. 
	// Require.js will use this file's name (CharacterController.js), to create a new  
	define(['lib/Class'], init);
}