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

			// if we have a view, then add the player to it
			if( this.view ){
				this.view.addPlayer( newPlayer.view );
			}
		},

		removePlayer: function( aClientID )
		{
			var player = this.allEntities.objectForKey( aClientID );

			if( this.view )
			{
				this.view.removeplayer( player.view );
			}

			this.allEntities.remove( aClientID );
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