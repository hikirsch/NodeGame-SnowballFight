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
		gingerBreadHouse		: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:-10, y:0},radius: 68, theme: '100' },
		blockOfIce1				: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0},	radius: 15, theme: '101' },
		blockOfIce2				: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0},	radius: 25, theme: '102' },
		blockOfIce3				: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0},	radius: 20, theme: '103' },
		blockOfIce4				: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:-10, y:0},radius: 48, theme: '104' },
		iceMountainOgilvyFlag	: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0},	radius: 85, theme: '105' },
		iglooGreenFlag			: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0},	radius: 55, theme: '106' },
		lakeHorizontalBridge	: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0},	radius: 70, theme: '107' },
		lakeVerticalBridge		: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0},	radius: 100, theme: '108' },
		smallPond				: { initialPosition:{x:5, y:5}, collisionMask: 0, collisionOffset: {x:0, y:0},	radius: 40,	theme: '109' }
	}
};

if (typeof window === 'undefined') {
	FieldEntityModel = init();
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}