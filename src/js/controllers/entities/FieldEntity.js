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

define(['lib/jsclass-core', 'lib/Vector', 'lib/Rectangle', 'controllers/FieldController', 'controllers/entities/GameEntity', 'model/FieldEntityModel'],
	function(JS, Vector, Rectangle, FieldController, GameEntity)
	{
		return new JS.Class(GameEntity,
		{
			initialize: function(anObjectID, aClientID, aFieldEntityModel, aFieldController, config)
			{
				this.callSuper();
				this.entityType = this.config.ENTITY_MODEL.ENTITY_MAP.FIELD_ENTITY;
				// Get information from the projectile model
				this.radius = aFieldEntityModel.radius;
			},

			/**
			 * Creates the event-listener function for handling collisions
			 * Note: This only is called on the server side
			 * @param aPackedCircle A PackedCircle which is tied to (and represents in the collision system) this entity
			 */
			setCollisionCircleProperties: function(aPackedCircle)
			{
				this.callSuper();
				this.collisionCircle.isFixed = true;
			}
		});
	}
);