/**
 File:
 	GameEntityFactory.js
 Created By:
	 Mario Gonzalez
 Project	:
	 Ogilvy Holiday Card 2010
 Abstract:
 	GameEntityFactory is in charge of creating GameEntities
 Basic Usage:
	 // TODO: FILL OUT
 */

var init = function(Vector, Rectangle, GameEntity, Character, Projectile, FieldEntity)
{
	return new JS.Class(
	{
		/**
		 * Creates an instance of the GameEntityFactory
		 * @param aFieldController
		 */
		initialize: function(aFieldController)
		{
		    this.fieldController = aFieldController;

			this.entityTypes = new SortedLookupTable();
			this.entityTypes.setObjectForKey(GameEntity, 'GameEntity');
			this.entityTypes.setObjectForKey(Character, 'Character');
			this.entityTypes.setObjectForKey(Projectile, 'Projectile');
			this.entityTypes.setObjectForKey(FieldEntity, 'FieldEntity');

			this.collisionBitmask = {
				'None': 0,
				'Character':  1 << 0,
				'Projectile': 1 << 1,
				'FieldEntity': 1 << 2
			};

		},

		createProjectile: function(anObjectID, aClientID, aProjectileModel, aFieldController)
		{
			//this.entityTypes.objectForKey(aCharacterType); // Retrieve class from sorted table
			var projectile = new Projectile(anObjectID, aClientID, aFieldController, aProjectileModel, 1);

			// Should snowballs collide with one another?
			projectile.collisionBitfield = this.collisionBitmask.Character | this.collisionBitmask.FieldEntity;

			return projectile;
		},

		createCharacter: function(anObjectID, aClientID, aFieldController)
		{
			var aNewCharacter = new Character(anObjectID, aClientID, aFieldController);

			// Collide against other characters, projectiles, and level objects
			aNewCharacter.collisionBitfield = this.collisionBitmask.Character | this.collisionBitmask.Projectile | this.collisionBitmask.FieldEntity;
			return aNewCharacter;
		},

		createFieldEntity: function(anObjectID, aFieldController, aFieldEntityModel)
		{
			var aNewFieldEntity = new FieldEntity(anObjectID, 0, aFieldController, aFieldEntityModel);
			aNewFieldEntity.position = new Vector(aFieldEntityModel.initialPosition.x, aFieldEntityModel.initialPosition.y);
			
			// Collide against characters and projectiles
			aNewFieldEntity.collisionBitfield = this.collisionBitmask.Character | this.collisionBitmask.Projectile;
			return aNewFieldEntity;
		}

	});
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('../lib/jsclass/core.js');
	require('../lib/Vector');
	require('../lib/Rectangle');
	require('../controllers/entities/GameEntity');
	require('../controllers/entities/Character');
	require('../controllers/entities/Projectile');
	require('../controllers/entities/FieldEntity');

	GameEntityFactory = init(Vector, Rectangle, GameEntity, Character, Projectile, FieldEntity);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector',
		'lib/Rectangle',
		'controllers/entities/GameEntity',
		'controllers/entities/Character',
		'controllers/entities/Projectile',
		'controllers/entities/FieldEntity',
		'lib/jsclass/core'], init);
}