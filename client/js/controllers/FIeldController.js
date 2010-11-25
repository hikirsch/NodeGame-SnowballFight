var init = function(Rectangle, FieldView)
{
	return new JS.Class(
	{
		initialize: function(game) 
		{
			console.log('(FieldController)::initialize');

			this.gameController = game;
			this.rectangle = new Rectangle(0, 0, 640, 480);

			// Might do away with different types of entities
			this.allEntities = new SortedLookupTable();
			this.players = new SortedLookupTable();
		},


		getWidth: function()
		{
			return this.rectangle.width;
		},
		
		getHeight: function()
		{
			return this.rectangle.height;
		},
		
		addPlayer: function( newPlayer )
		{
			this.allEntities.setObjectForKey( newPlayer, newPlayer.objectID );
			this.players.setObjectForKey( newPlayer, newPlayer.clientID );

			// if we have a view, then add the player to it
			if( this.view ){
				this.view.addPlayer( newPlayer.view );
			}
		},

		removePlayer: function( connectionID )
		{
			var player = this.players.objectForKey(connectionID);
			this.removeEntity( player.objectID );
			this.players.remove(player);
		},

		removeEntity: function( objectID )
		{
			var entity = this.allEntities.objectForKey( objectID );

			if( this.view ) {
				this.view.removeEntity( entity.view );
			}

			this.allEntities.remove( objectID );
		},

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

		updateEntity: function( objectID, updatedPosition ) {
			var entity = this.allEntities.objectForKey( objectID );

			if( entity != null ) {
				entity.position.x = updatedPosition.x;
				entity.position.y = updatedPosition.y;
			}
		},

		tick: function(speedFactor)
		{
			// Update players
			this.allEntities.forEach( function(key, entity){ 
				entity.tick(speedFactor)
			}, this );
		},

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
		}
	});
};

if (typeof window === 'undefined')
{
	require('../lib/jsclass/core.js');
	require('../lib/Rectangle.js');
	require('../view/FieldView.js');
	FieldController = init(Rectangle, FieldView);
}
else
{
	define(['lib/Rectangle', 'view/FieldView', 'lib/jsclass/core'], init);
}