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
		blockOfIce1		: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0}, radius: 10, theme: "block-of-ice-1" }
	}
};

if (typeof window === 'undefined') {
	FieldEntityModel = init();
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}