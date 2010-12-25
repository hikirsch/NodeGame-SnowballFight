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

define(function()
{
	return {
		yeti: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '200', nickname:'Notyetti' },
		penguin: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '201', nickname:'Tuxedo' },
		robot : { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '202', nickname:'BleepBleep' },
		snowman: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '203', nickname:'Snowbisness' },
		tree: { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '204', nickname:'Pine3' },
		'smash-TV' : { initialPosition:null, collisionMask: 0, collisionOffset: {x:0, y:05}, radius: 16, theme: '999', nickname: 'SmashTV' }
	}
});