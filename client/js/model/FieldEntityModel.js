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

var init = function(EntityModel)
{
    var charactersAndProjectiles = EntityModel.COLLISION_GROUPS.CHARACTER | EntityModel.COLLISION_GROUPS.PROJECTILE;
	var charactersOnly = EntityModel.COLLISION_GROUPS.CHARACTER;


	return {
		gingerBreadHouse		: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:4}, radius: 75, theme: '100' },
		blockOfIce1				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:-2},	radius: 18, theme: '101' },
		blockOfIce2				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:-10, y:-5},	radius: 18, theme: '102' },
		blockOfIce3				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:0},	radius: 18, theme: '103' },
		blockOfIce4				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:2},radius: 48, theme: '104' },
		blockOfIce5				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:2},radius: 48, theme: '105' },
		blockOfIce6				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:2},radius: 48, theme: '106' },
		iceMountainOgilvyFlag	: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y: 20},	radius: 90, theme: '107' },
		iglooGreenFlag			: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:-10},	radius:60, theme: '108' },
		iglooRedFlag			: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:-10},	radius: 60, theme: '109' },
		lakeHorizontalBridge	: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:0},	radius: 70, theme: '110' },
		lakeVerticalBridge		: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:0},	radius: 80,theme: '111' },
		largePond1				: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:10},radius: 91,	theme: '112' },
		smallPond1				: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:0},	radius: 35,	theme: '113' },
		smallPond2				: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:0},	radius: 35,	theme: '114' },
		smallPond3				: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:0},	radius: 35,	theme: '115' }
	}
};

if (typeof window === 'undefined') {
	require('js/model/EntityModel');
	FieldEntityModel = init(EntityModel);
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['model/EntityModel'], init);
}