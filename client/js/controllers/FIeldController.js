var init = function(Vector, Rectangle, FieldView, PackedCircle, PackedCircleManager)
{
	return new JS.Class(
	{
		initialize: function(gameController, gameModel )
		{
			console.log('(FieldController)::initialize');

			this.gameController = gameController;
			this.packedCircleManager = null;

			// Might do away with different types of entities tables
			this.allEntities = new SortedLookupTable();
			this.players = new SortedLookupTable();    		// A special SortedLookupTable in which the key is the clientID (WebSocket connection) not the objectID

			this.setModel( gameModel );
		},

		createView: function( gameModel )
		{
			if( FieldView != null ) {
				this.view = new FieldView( this, gameModel );
			}
		},

		/**
		 * Create the PackedCircleManager
		 * This is only created on the server side
		 */
		createPackedCircleManager: function()
		{
			this.packedCircleManager = new PackedCircleManager( {centeringPasses: 0, collisionPasses: 1, dispatchCollisionEvents: true});
		},

		/**
		 * Creates an entity from an EntityDescription.
		 * This is called when the game receives an entity that it does not want to handle in a special way
		 * @param anEntityDescription	A EntityDescription containing all information needed to create this entity
		 */
		createAndAddEntityFromDescription: function( anEntityDescription )
		{
			var aNewEntity = null;
			aNewEntity = this.gameController.entityFactory.createEntityFromDescription(anEntityDescription, this);
			this.addEntity( aNewEntity );
			return aNewEntity;
		},

		/**
		 * Adds a player to the field
		 */
		addPlayer: function( anObjectID, aClientID, aCharacterModel )
		{
			var aNewCharacter = this.gameController.entityFactory.createCharacter(anObjectID, aClientID, aCharacterModel, this);

			// Add internally, and store in a special 'players' SortedLookupTable (via clientID)
			this.addEntity(aNewCharacter);
			this.players.setObjectForKey( aNewCharacter, aNewCharacter.clientID );

			return aNewCharacter;
		},

		/**
		 * Fires a projectile from a character.
		 * Note: This is only called on the servers version of the game.
		 * @param aCharacter		The character which fired the projectile
		 * @param aProjectileModel	A Projectile Model containing information for this projectile such as force, maxspeed, angle etc
		 */
		fireProjectileFromCharacterUsingProjectileModel: function( aCharacter, aProjectileModel )
		{
			var objectID = this.gameController.getNextEntityID();
			var aNewProjectile = this.gameController.entityFactory.createProjectile(objectID, aCharacter.clientID, aProjectileModel, this);
			this.addEntity( aNewProjectile );

			// Apply impulse to character acceleration in opposite angle of the projectile
			var currentAngle = aNewProjectile.angle;
			var impulseForce = -10;//aProjectileModel.force * 2;
			var impulseVector = new Vector(Math.cos(currentAngle) * impulseForce, Math.sin(currentAngle) * impulseForce);

			this.gameController.log(impulseVector);
			// aCharacter.acceleration.add( impulseVector );
			return aNewProjectile;
		},


		/**
		 * Internal function. Adds an entity to our collection, and adds it to the view if we have one
		 * @param anEntity	An entity to add, should already be created and contain a unique objectID
		 */
		addEntity: function(anEntity)
		{
			this.allEntities.setObjectForKey( anEntity, anEntity.objectID );

			// If we have a circle collision manager - create a acked circle and add it to that
			if(this.packedCircleManager)
			{
				// Create the PackedCircle
				var aPackedCircle = new PackedCircle(anEntity.radius);
				anEntity.setCollisionCircleProperties(aPackedCircle);

				// Allow the entity to setup the collision callback, and set some properties inside aPackedCircle
				// (Note) Entities do not store a reference to packedCircle. (although im set in stone about this one yet)
				this.packedCircleManager.addCircle(aPackedCircle);
			}


			// If we have a view, then add the player to it
			if( this.view ) {
				this.view.addEntity( anEntity.getView() );
			}

		},

		/**
		 * Mainloop
		 * @param speedFactor A number that tells us how close to the desired framerate the game is running. 1.0 means perfectly accurate
		 */
		tick: function(speedFactor, gameClock)
		{
			// Update players
			this.allEntities.forEach( function(key, entity){
				entity.tick(speedFactor, gameClock);
			}, this );
		},

		onEndGame: function()
		{

		},

		/**
		 * Updates the entity based on new information (called by AbstractClientGame::renderAtTime)
		 * @param {int}		objectID  	ObjectID we want to update
		 * @param {Vector}	newPosition	position
		 * @param {Number}	newRotation	rotation
		 * @param {EntityDescription}	entityDesc	An object containing new properties for this entity
		 */
		updateEntity: function( objectID, newPosition, newRotation, entityDesc ) {
			var entity = this.allEntities.objectForKey( objectID );

			if( entity != null ) {
				entity.position.x = newPosition.x;
				entity.position.y = newPosition.y;
				entity.rotation = newRotation;

				// Only apply these if they exist in the entity description.
				//['rotation'] && (entity.rotation = entityDesc.rotation));
				if(entityDesc == undefined)  {
					debugger;
				}

				// Set if sent
				(entityDesc.score && (entity.score = entityDesc.score));
				(entityDesc.theme && (entity.theme = entityDesc.theme));
				(entityDesc.nickname && (entity.nickname = entityDesc.nickname));
			} else {
				console.log("(FieldController)::updateEntity - Error: Cannot find entity with objectID", objectID);
			}
		},


		/**
		 * Remove a player.
		 * Does player stuff, then calls removeEntity.
		 * @param connectionID	ConnectionID of the player who jumped out of the game
		 */
		removePlayer: function( connectionID )
		{
			var player = this.players.objectForKey(connectionID);

			if(!player) {
				console.log("(FieldController), No 'Character' with connectionID " + connectionID + " ignoring...");
				return;
			}

			console.log( "(FieldController) Removing Player" );
			this.removeEntity( player.objectID );
			this.players.remove(player.clientID);
		},

		/**
		 * Checks an array of "active entities", against the existing ones.
		 * It's used to remove entities that expired in between two updates
		 * @param activeEntities
		 */
		removeExpiredEntities: function( activeEntities )
		{
			var entityKeysArray = this.allEntities._keys,
			i = entityKeysArray.length,
			key;

			while (i--)
			{
				key = entityKeysArray[i];

				// This entity is still active. Move along.
				if( activeEntities[key] )
					continue;

				// This entity is not active, check if it belongs to the server
				var entity = this.allEntities.objectForKey(key);

				if(entity.clientID == 0)  {
					continue;
				}

				if( GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.CHARACTER == entity.entityType ) {
					this.removePlayer( entity.clientID );
				} else {
					// Is not active, and does not belong to the server
//					console.log("(FieldController) removeEntity", key);
					this.removeEntity(key);
				}
			}
		},

		/**
		 * Removes an entity by it's ID
		 * @param objectID
		 */
		removeEntity: function( objectID )
		{
			// console.log("Removing Entity!", objectID);
			var entity = this.allEntities.objectForKey( objectID );

			// Clients contain a view, server entities contain a collisionCircle.
			// If this statement is false then something went wrong, so no check on second conditional
			if( this.view ) {
				this.view.removeEntity( entity.view );
			} else {
				this.packedCircleManager.removeCircle(entity.collisionCircle);
			}

			entity.dealloc();
			this.allEntities.remove( objectID );
		},

		/**
		 * Accessors
		 */
		getEntityWithObjectID: function( anEntityObjectID )
		{
			return this.allEntities.objectForKey( anEntityObjectID );
		},

		getPlayerWithClientID: function( aClientID )
		{
			return this.players.objectForKey(aClientID);
		},

		getWidth: function()
		{
			return this.rectangle.width;
		},

		getHeight: function()
		{
			return this.rectangle.height;
		},

		getLeft: function()
		{
			return this.view.getLeft();
		},

		getTop: function()
		{
			return this.view.getTop();
		},

		hasView: function()
		{
			return this.view != null;
		},

		dealloc: function()
		{
			this.allEntities.dealloc();
			this.players.dealloc();

			delete this.players;
			delete this.allEntities;
		},

		setModel: function(aGameModel)
		{
			this.rectangle = new Rectangle(0, 0, aGameModel.width, aGameModel.height);

			if( this.view )
			{
				this.view.resize( aGameModel.height, aGameModel.width );
			}
		},
		
		/**
		 * Return the PackedCircleManager
		 * @return {PackedCircleManager} The PackedCircleManager instance.
		 */
		getCollisionManager: function()
		{
			return this.packedCircleManager;
		}
	});
};

if (typeof window === 'undefined')
{
	require('js/lib/jsclass/core.js');
	require('js/lib/Vector.js');
	require('js/lib/Vector.js');
	require('js/lib/circlepack/PackedCircleManager.js');
	require('js/lib/circlepack/PackedCircle.js');
	require('js/lib/Rectangle.js');
	FieldController = init(Vector, Rectangle, null, PackedCircle, PackedCircleManager);
}
else
{
	define(['lib/Vector', 'lib/Rectangle', 'view/FieldView', "lib/circlepack/PackedCircle", "lib/circlepack/PackedCircleManager", 'lib/jsclass/core'], init);
}