/**
File:
	Projectile.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	A basic projectile that uses ProjectileModel.js objects to define it's attributes
Basic Usage:
*/

var init = function(Vector, Rectangle, FieldController, GameEntity)
{
	return new JS.Class(GameEntity,
	{
		initialize: function(anObjectID, aClientID, aFieldController, projectileModel, force)
		{
			this.callSuper(anObjectID, aClientID, aFieldController);
			this.entityType = GAMECONFIG.ENTITY_MODEL.PROJECTILE; // 			

			/**
			 *
			this.velocity = new Vector( 0, 0 );		// Rolling velocity
			this.acceleration = new Vector( 0, 0 );	// All combined forced. reset every tick

			// Movement scalar quantities
			this.damping = 0.96; 					// Bring velocity to 0 ( or near zero anyway :) ) over time
			this.rotation = 0;

			// Flags
			this.collisionBitfield = 0;
			this.radius = 5;
//			this.isCollidable = false;				// Objects can collide against us, but they might be able to go through us ( For example, a puddle )
//			this.isFixed = false; 					// Obje
			 */
			this.position = new Vector( Math.random() * this.fieldController.getWidth(), Math.random() * this.fieldController.getHeight() );

			this.maxSpeed = projectileModel.maxSpeed;
			this.radius = projectileModel.radius;
			this.angle = projectileModel.angle;
			this.force = force;

			this.damping = 1.0;
			this.velocity = new Vector(2, 0);
		}
	});
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('../../lib/jsclass/core.js');
	require('../../lib/Vector');
	require('../../lib/Rectangle');
	require('../FieldController');
	require('./GameEntity');

	var sys = require('sys');
	Projectile = init(Vector, Rectangle, FieldController, GameEntity);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector', 'lib/Rectangle', 'controllers/FieldController', 'controllers/entities/GameEntity', 'model/ProjectileModel', 'lib/jsclass/core'], init);
}