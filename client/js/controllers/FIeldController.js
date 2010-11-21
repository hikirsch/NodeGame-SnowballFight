var init = function(Rectangle, FieldView)
{
	return new JS.Class(
	{
		initialize: function(game) 
		{

//			console.log('(FieldController)::initialize');

			this.gameController = game;

			this.rectangle = new Rectangle(0, 0, 640, 480);
			
			// Things in the game
			this.players = new SortedLookupTable(); // Active players
			this.projectiles = new SortedLookupTable(); // Things fired
			this.entities = new SortedLookupTable(); // Everything else, e.g. trees, rocks, powerups, dogs, cats
			
			// if our game has a view, then create one
			
//			console.log('the game controllers view exists: ' + this.gameController.view );
			if( this.gameController.view )
			{
				this.view = new FieldView(this);
			}
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
			console.log( "Adding new player", newPlayer);
			this.players.setObjectForKey( newPlayer, newPlayer.clientID );
			
			// if we have a view, then add the player to it
			if( this.view )
			{
				this.view.addPlayer( newPlayer.view );
			}
		},
		
		tick: function(speedFactor)
		{
			// Update players
			this.players.forEach( function(key, player){ 
				player.tick(speedFactor)
			}, this );

			// Update projectiles
			this.projectiles.forEach( function(key, projectile){ 
				projectile.tick(speedFactor)
			}, this );

			// Update entities
			this.entities.forEach( function(key, entity){entity.tick(speedFactor) }, this );
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