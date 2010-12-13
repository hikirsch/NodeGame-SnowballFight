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
		yeti: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '200' },
		penguin: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '201' },
		robot : { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '202' },
		snowman: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '203' },
		tree: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '204' },
		smashTV : { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '999' }
	}
};

if (typeof window === 'undefined') {
	CharacterModel = init();
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}