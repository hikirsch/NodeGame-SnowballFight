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
		gingerBreadHouse		: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:2}, radius: 62, theme: '100' },
		blockOfIce1				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:2, y:0},	radius: 5, theme: '101' },
		blockOfIce2				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:0},	radius: 14, theme: '102' },
		blockOfIce3				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:0},	radius: 18, theme: '103' },
		blockOfIce4				: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:6},radius: 40, theme: '104' },
		iceMountainOgilvyFlag	: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:22},	radius: 72, theme: '105' },
		iglooGreenFlag			: { initialPosition:{x:5, y:5}, collisionMask: charactersAndProjectiles, collisionOffset: {x:0, y:-2},	radius: 48, theme: '106' },
		lakeHorizontalBridge	: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:0},	radius: 70, theme: '107' },
		lakeVerticalBridge		: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:0},	radius: 100, theme: '108' },
		smallPond				: { initialPosition:{x:5, y:5}, collisionMask: charactersOnly, collisionOffset: {x:0, y:0},	radius: 35
			,	theme: '109' }
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