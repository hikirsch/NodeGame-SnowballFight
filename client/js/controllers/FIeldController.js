var init = function(Vector, Rectangle, FieldView)
{
	return new JS.Class(
	{
		initialize: function(game)
		{
			console.log('(FieldController)::initialize');

			this.gameController = game;
			this.rectangle = new Rectangle(0, 0, 640, 480);

			// Might do away with different types of entities tables
			this.allEntities = new SortedLookupTable();
			this.players = new SortedLookupTable();
		},

		/**
		 * Adds a player to the field
		 */
		addPlayer: function( anObjectID, aClientID, playerType )
		{
			var aNewCharacter = this.gameController.entityFactory.createCharacter(anObjectID, aClientID, playerType, this);

			// Store in our collections
			this.allEntities.setObjectForKey( aNewCharacter, aNewCharacter.objectID );
			this.players.setObjectForKey( aNewCharacter, aNewCharacter.clientID );

			// If we have a view, then add the player to it
			if( this.view ) {
				this.view.addPlayer( aNewCharacter.view );
			}

			return aNewCharacter;
		},

		fireProjectileFromCharacterUsingProjectileModel: function( aCharacter, aProjectileModel )
		{
			var objectID = this.gameController.getNextEntityID();
			var aNewProjectile = this.gameController.entityFactory.createProjectile(objectID, aCharacter.clientID, aProjectileModel, this);

			// Apply impulse to character acceleration in opposite angle of the projectile
			var currentAngle = aCharacter.velocity.angle();
			var impulseForce = 3;//aProjectileModel.force * 2;
			var impulseVector = new Vector(Math.cos(currentAngle) * -impulseForce, Math.sin(currentAngle) * -impulseForce);

//			aCharacter.velocity.mul(0);
			aCharacter.acceleration.add( impulseVector );
			
			// this.allEntities.setObjectForKey( aNewProjectile, aNewCharacter.objectID );
			
			return aNewProjectile;
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
	require('../lib/Rectangle.js');
	require('../view/FieldView.js');
	FieldController = init(Vector, Rectangle, FieldView);
}
else
{
	define(['lib/Vector', 'lib/Rectangle', 'view/FieldView', 'lib/jsclass/core'], init);
}