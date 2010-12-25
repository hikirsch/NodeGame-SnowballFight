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

define(['lib/jsclass-core', 'lib/Vector', 'lib/Rectangle', 'controllers/entities/GameEntity', 'controllers/entities/Character', 'controllers/entities/Projectile', 'controllers/entities/FieldEntity', 'model/CharacterModel'],
	function(JS, Vector, Rectangle, GameEntity, Character, Projectile, FieldEntity, CharacterModel)
	{
		return new JS.Class(
		{
			/**           asd ad
			 * Creates an instance of the GameEntityFactory
			 * @param aFieldController
			 */
			initialize: function(aFieldController, config)
			{
				this.fieldController = aFieldController;
				this.config = config;
				this.entityModel = this.config.ENTITY_MODEL;


				this.entityTypes = new SortedLookupTable();
				this.entityTypes.setObjectForKey(GameEntity, 'GameEntity');
				this.entityTypes.setObjectForKey(Character, 'Character');
				this.entityTypes.setObjectForKey(Projectile, 'Projectile');
				this.entityTypes.setObjectForKey(FieldEntity, 'FieldEntity');

				this.collisionGroups = this.config.ENTITY_MODEL.COLLISION_GROUPS;
			},
			createProjectile: function(anObjectID, aClientID, aProjectileModel, aFieldController)
			{
				//this.entityTypes.objectForKey(aCharacterType); // Retrieve class from sorted table
				var projectile = new Projectile(anObjectID, aClientID, aProjectileModel, aFieldController);

				// Should snowballs collide with one another?
				projectile.collisionGroup = this.collisionGroups.PROJECTILE;
				projectile.collisionMask = this.collisionGroups.CHARACTER | this.collisionGroups.FIELD_ENTITY;

				return projectile;
			},

			createCharacter: function(anObjectID, aClientID, aCharacterModel, aFieldController)
			{
				var aNewCharacter = new Character(anObjectID, aClientID, aCharacterModel, aFieldController);

				// Collide against other characters, projectiles, and level objects
				aNewCharacter.collisionGroup = this.collisionGroups.CHARACTER;
				aNewCharacter.collisionMask = this.collisionGroups.CHARACTER | this.collisionGroups.PROJECTILE | this.collisionGroups.FIELD_ENTITY;

				return aNewCharacter;
			},

			createFieldEntity: function(anObjectID, aClientID, aFieldEntityModel, aFieldController )
			{
				var aNewFieldEntity = new FieldEntity(anObjectID, aClientID, aFieldEntityModel, aFieldController);
				aNewFieldEntity.position = new Vector(aFieldEntityModel.initialPosition.x, aFieldEntityModel.initialPosition.y);

				// Collide against characters and projectiles
				aNewFieldEntity.collisionGroup = this.collisionGroups.FIELD_ENTITY;
				aNewFieldEntity.collisionMask = aFieldEntityModel.collisionMask;

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
	}
);