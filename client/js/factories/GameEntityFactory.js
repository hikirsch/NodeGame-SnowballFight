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
		/**           asd ad
		 * Creates an instance of the GameEntityFactory
		 * @param aFieldController
		 */
		initialize: function(aFieldController, anEntityModel)
		{
		    this.fieldController = aFieldController;
			this.entityModel = anEntityModel;

			this.entityTypes = new SortedLookupTable();
			this.entityTypes.setObjectForKey(GameEntity, 'GameEntity');
			this.entityTypes.setObjectForKey(Character, 'Character');
			this.entityTypes.setObjectForKey(Projectile, 'Projectile');
			this.entityTypes.setObjectForKey(FieldEntity, 'FieldEntity');

			this.collisionGroups = {
				'None': 0,
				'Character':  1 << 0,
				'Projectile': 1 << 1,
				'FieldEntity': 1 << 2
			};
		},
		createProjectile: function(anObjectID, aClientID, aProjectileModel, aFieldController)
		{
			//this.entityTypes.objectForKey(aCharacterType); // Retrieve class from sorted table
			var projectile = new Projectile(anObjectID, aClientID, aProjectileModel, aFieldController);

			// Should snowballs collide with one another?
			projectile.collisionGroup = this.collisionGroups.Projectile;
			projectile.collisionMask = this.collisionGroups.Character;// | this.collisionGroups.FieldEntity;

			return projectile;
		},

		createCharacter: function(anObjectID, aClientID, aCharacterModel, aFieldController)
		{
			var aNewCharacter = new Character(anObjectID, aClientID, aCharacterModel, aFieldController);

			// Collide against other characters, projectiles, and level objects
			aNewCharacter.collisionGroup = this.collisionGroups.Character;
			aNewCharacter.collisionMask = this.collisionGroups.Character | this.collisionGroups.Projectile | this.collisionGroups.FieldEntity;

			return aNewCharacter;
		},

		createFieldEntity: function(anObjectID, aClientID, aFieldEntityModel, aFieldController )
		{
			var aNewFieldEntity = new FieldEntity(anObjectID, aClientID, aFieldEntityModel, aFieldController);
			aNewFieldEntity.position = new Vector(aFieldEntityModel.initialPosition.x, aFieldEntityModel.initialPosition.y);
			
			// Collide against characters and projectiles
			aNewFieldEntity.collisionGroup = this.collisionGroups.FieldEntity;
			aNewFieldEntity.collisionMask = this.collisionGroups.Character;
			
			return aNewFieldEntity;
		},

		createEntityFromDescription: function(anEntityDescription, aFieldController)
		{
			var entityMap = this.entityModel.ENTITY_MAP,
				model = null,
				creationFunction = null;

			switch(anEntityDescription.entityType)
			{
				case entityMap.CHARACTER:
					console.log("Ooops? Character created");
				break;
				case entityMap.PROJECTILE:
					model = GAMECONFIG.PROJECTILE_MODEL.defaultSnowball;
					creationFunction = this.createProjectile;
				break;
				case entityMap.FIELD_ENTITY:
					model = this.entityModel.DEFAULT_MODEL;
					creationFunction = this.createFieldEntity;
				break;
				default:
				   console.log("No mapping for " + anEntityDescription.entityType);
			}


			if(creationFunction == null) {
				throw {name: "Entity Error", message: "Could not create entity", info: anEntityDescription};
			}

			model.theme = anEntityDescription.theme;
			model.initialPosition = new Vector(anEntityDescription.x, anEntityDescription.y);

			// Call the matched create function
			return creationFunction.apply(this,[anEntityDescription.objectID, anEntityDescription.clientID, model, aFieldController]);
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