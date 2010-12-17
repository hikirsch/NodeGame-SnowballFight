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
			this.playersArray = []; // Used for ranking, TODO: figure out better way to implement character ranking

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

			this.resetPlayersArray();
			return aNewCharacter;
		},

		resetPlayersArray: function()
		{
			var aPlayersArray = [];
			this.players.forEach( function(key, entity){
				aPlayersArray.push(entity)
			}, this );

			this.playersArray = aPlayersArray;
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

			var impulseForce = -4.5;
			var impulseVector = new Vector(Math.cos(currentAngle) * impulseForce, Math.sin(currentAngle) * impulseForce);

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

			console.log('(FieldController) Adding entity');

			// If we have a circle collision manager - create a acked circle and a it to that
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
			// Update entities
			this.allEntities.forEach( function(key, entity){
				entity.tick(speedFactor, gameClock);
			}, this );

			// Rank players
			this.playersArray.sort(function(a, b) {
				var comparisonResult = 0;
				if(a.score < b.score) comparisonResult = 1;
				else if(a.score > b.score) comparisonResult = -1;
				return comparisonResult;
			});

			// Set the players rank to the their index in the sorted array
			var len = this.playersArray.length;
			for(var i = 0; i < len; i++)
				this.playersArray[i].rank = i+1;
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

				entity.themeMask = entityDesc.themeMask;

				// Set if sent
				(entityDesc.theme && (entity.theme = entityDesc.theme));
				(entityDesc.score && (entity.score = entityDesc.score));
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
			// TODO: we shouldn't be checking undefined here
			if( this.players ) {
				var player = this.players.objectForKey(connectionID);

				if(!player) {
					console.log("(FieldController), No 'Character' with connectionID " + connectionID + " ignoring...");
					return;
				}

				console.log( "(FieldController) Removing Player" );
				this.removeEntity( player.objectID );
				this.players.remove(player.clientID);
			}
			else
			{
				console.log("(FieldController) this.players was undefined!");
			}
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

//				if(entity.clientID == 0)  {
//					continue;
//				}

				if( GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.CHARACTER == entity.entityType ) {
					this.removePlayer( entity.clientID );
				} else {
					// Is not active, and does not belong to the server
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
			console.log("(FieldController) removingEntity");
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

		getRandomSafeLocation: function()
		{

			var position = new Vector(Math.random() * this.model.width, Math.random() * this.model.height);
			var attempts = 0;

			// Attempt to find a spot to place this present that is not above stuff
			while(this.fieldController.packedCircleManager.getCircleAt( position.x, position.y, 50*50))
			{
				attempts++;
				position.set(Math.random() * this.model.width, Math.random() * this.model.height)
			}
		},

		getPlayerStats: function()
		{
			var playerStats = [];

			this.players.forEach( function( clientId, player ) {
				playerStats.push({
					nickname: player.nickname,
					score: player.score
				});
			}, this );

			return playerStats;
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
			this.players.forEach( function(key, entity){
				this.removePlayer(entity.clientID);
			}, this );

			this.allEntities.forEach( function(key, entity){
				this.removeEntity(entity.objectID);
			}, this );


			this.allEntities.dealloc();
			this.players.dealloc();

			if(this.view) this.view.dealloc();

			delete this.view;
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