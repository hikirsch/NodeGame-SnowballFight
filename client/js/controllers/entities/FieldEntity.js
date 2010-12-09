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
		initialize: function(anObjectID, aFieldController, aFieldEntityModel)
		{
			this.callSuper(anObjectID, 0, aFieldController);
			this.entityType = GAMECONFIG.ENTITY_MODEL.FIELD_ENTITY; //

			// Get information from the projectile model
			this.collisionOffset = aFieldEntityModel.initialPosition;
			this.radius = aFieldEntityModel.radius;
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