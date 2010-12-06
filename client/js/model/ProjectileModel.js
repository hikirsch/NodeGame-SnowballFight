/**
 File:
 	ProjectileModel.js
 Created By:
	 Mario Gonzalez
 Project	:
	 Ogilvy Holiday Card 2010
 Abstract:
 	Contains the properties for the various types of projectiles
 Basic Usage:
 */

var init = function()
{
	return {
		defaultSnowball	: { initialPosition: null, angle: 0, radius: 3, maxVelocity: 5, collisionGroup: 0, force: 1, image: "yeah.png" },
		superSnowball	: { initialPosition: null, angle: 0, radius: 5, maxVelocity: 8, collisionGroup: 0, force: 1, image: "yeah.png" }
	}
};

if (typeof window === 'undefined') {
	ProjectileModel = init();
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}