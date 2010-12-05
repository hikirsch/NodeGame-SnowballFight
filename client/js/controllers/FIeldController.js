var init = function(Vector, Rectangle, FieldView, PackedCircle, PackedCircleManager)
{
	return new JS.Class(
	{
		initialize: function(game)
		{
			console.log('(FieldController)::initialize');

			this.gameController = game;

			this.packedCircleManager = new PackedCircleManager(0,4);
			this.rectangle = new Rectangle(0, 0, 640, 480);

			// Might do away with different types of entities tables
			this.allEntities = new SortedLookupTable();
			this.players = new SortedLookupTable();    		// A special SortedLookupTable in which the key is the clientID (websocket connection) not the objectID
		},

		/**
		 * Creates the field view, used by the AbstractClientGame
		 * @param aGameView
		 */
		createView: function(aGameView)
		{
			// if our game has a view, then create one
			if( this.gameController.view )
			{
				this.view = new FieldView(this);
			}
		},
		
		createAndAddEntityFromDescription: function( anEntityDescription )
		{
			var anEntity = null;
			if( anEntityDescription.entityType != GAMECONFIG.ENTITY_MODEL.PROJECTILE ) {
				console.log("(FieldController) Don't know how to handle entity type: '" + anEntityDescription.entityType + "'! Ignoring... ");
				return 0;
			}

			// For now we only know hwo to add projectiles using this method
			var aProjectileModel = GAMECONFIG.PROJECTILE_MODEL.defaultSnowball; // TODO: Send projectile type
			var aNewProjectile = this.gameController.entityFactory.createProjectile(anEntityDescription.objectID, anEntityDescription.clientID, aProjectileModel, this);
			this.addEntity( aNewProjectile );

			return aNewProjectile;
		},

		/**
		 * Adds a player to the field
		 */
		addPlayer: function( anObjectID, aClientID, playerType )
		{
			var aNewCharacter = this.gameController.entityFactory.createCharacter(anObjectID, aClientID, playerType, this);

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
			var currentAngle = aCharacter.velocity.angle();
			var impulseForce = 3;//aProjectileModel.force * 2;
			var impulseVector = new Vector(Math.cos(currentAngle) * -impulseForce, Math.sin(currentAngle) * -impulseForce);

//			aCharacter.velocity.mul(0);
			aCharacter.acceleration.add( impulseVector );			
			return aNewProjectile;
		},


		/**
		 * Internal function. Adds an entity to our collection, and adds it to the view if we have one
		 * @param anEntity	An entity to add, should already be created and contain a unique objectID
		 */
		addEntity: function(anEntity)
		{
			this.allEntities.setObjectForKey( anEntity, anEntity.objectID );

			var aPackedCircle = new PackedCircle( anEntity, anEntity.radius );
			aPackedCircle.collisionBitfield = anEntity.collisionBitfield;
			aPackedCircle.position = anEntity.position;

			console.log('(FieldController PackedCircle:', aPackedCircle);
			// If we have a view, then add the player to it
			if( this.view ) {
				this.view.addEntity( anEntity.view );
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

		/**
		 * Updates an entity postion
		 * @param objectID
		 * @param updatedPosition
		 */
		updateEntity: function( objectID, updatedPosition ) {
			var entity = this.allEntities.objectForKey( objectID );

			if( entity != null ) {
				entity.position.x = updatedPosition.x;
				entity.position.y = updatedPosition.y;
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
			this.removeEntity( player.objectID );
			this.players.remove(player);
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

				// This entity is not active - remove
				console.log("(FieldController) removeEntity", key);
				this.removeEntity(key);
			}
		},

		/**
		 * Removes an entity by it's ID
		 * @param objectID
		 */
		removeEntity: function( objectID )
		{
			var entity = this.allEntities.objectForKey( objectID );

			if( this.view ) {
				this.view.removeEntity( entity.view );
			}

			this.allEntities.remove( objectID );
		},


		/**
		 * Accessors
		 */
		getEntityWithObjectID: function( anEntityObjectID )
		{
			return this.allEntities.objectForKey( anEntityObjectID );
		},
		getWidth: function()
		{
			return this.rectangle.width;
		},
		getHeight: function()
		{
			return this.rectangle.height;
		}
	});
};

if (typeof window === 'undefined')
{
	require('../lib/jsclass/core.js');
	require('../lib/Vector.js');
	require('../lib/Vector.js');
	require('../lib/circlepack/PackedCircleManager.js');
	require('../lib/circlepack/PackedCircle.js');
	require('../lib/Rectangle.js');
	require('../view/FieldView.js');
	FieldController = init(Vector, Rectangle, FieldView, PackedCircle, PackedCircleManager);
}
else
{
	define(['lib/Vector', 'lib/Rectangle', 'view/FieldView', "lib/circlepack/PackedCircle", "lib/circlepack/PackedCircleManager", 'lib/jsclass/core'], init);
}