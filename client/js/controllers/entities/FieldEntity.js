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
		initialize: function(anObjectID, aClientID, aFieldController, aFieldEntityModel)
		{
			this.callSuper();
			this.entityType = GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.FIELD_ENTITY; //
		   	this.position = aFieldEntityModel.initialPosition;
			// Get information from the projectile model
//			this.collisionOffset = aFieldEntityModel.collisionOffset;
			this.radius = aFieldEntityModel.radius;
		},

		/**
		 * Creates the event-listener function for handling collisions
		 * Note: This only is called on the server side
		 * @param aPackedCircle A PackedCircle which is tied to (and represents in the collision system) this entity
		 */
		setupCollisionEvents: function(aPackedCircle)
		{
			this.callSuper();
			this.collisionCircle.isFixed = true;
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
	FieldEntity = init(Vector, Rectangle, FieldController, GameEntity);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector', 'lib/Rectangle', 'controllers/FieldController', 'controllers/entities/GameEntity', 'model/FieldEntityModel', 'lib/jsclass/core'], init);
}