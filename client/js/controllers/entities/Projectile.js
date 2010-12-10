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
		initialize: function(anObjectID, aClientID, projectileModel, aFieldController)
		{
			this.callSuper();
			this.entityType = GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.PROJECTILE; // 			

			this.force = projectileModel.force;
			// Get information from the projectile model
			this.position = projectileModel.initialPosition;
			this.maxVelocity = projectileModel.maxVelocity;
			this.radius = projectileModel.radius;
			this.angle = projectileModel.angle;

			this.damping = 1.0;

			this.velocity = new Vector(Math.cos(this.angle) * this.maxVelocity * this.force, Math.sin(this.angle) * this.maxVelocity * this.force);
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