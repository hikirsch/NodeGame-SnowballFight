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
		yeti: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '200', nickname:'Notyetti' },
		penguin: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '201', nickname:'Tuxedo' },
		robot : { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '202', nickname:'BleepBleep' },
		snowman: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '203', nickname:'Snowbisness' },
		tree: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '204', nickname:'Pine3' },
		smashTV : { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '999', nickname: 'SmashTV' }
	}
};

if (typeof window === 'undefined') {
	CharacterModel = init();
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}