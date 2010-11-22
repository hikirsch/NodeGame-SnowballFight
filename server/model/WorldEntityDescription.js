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
require('../../client/js/lib/jsclass/core.js');
require('../../client/js/lib/SortedLookupTable.js');
require('../../client/js/controllers/entities/GameEntity');
require('../controllers/ServerGame');

var init = function()
{
	return new JS.Class(
	{
		initialize: function( aGameInstance )
		{
			var fieldController = aGameInstance.fieldController;
			this.entityDescription = new SortedLookupTable();

			// Construct players
			fieldController.players.forEach( function(key, player)
			{
				this.entityDescription.setObjectForKey( player.constructEntityDescription(), player.objectID );
				this.entityDescription.setObjectForKey( player.constructEntityDescription(), player.objectID+1 );
			}, this );

			// Construct projectiles
			fieldController.projectiles.forEach( function(key, projectile)
			{
				this.entityDescription.setObjectForKey( projectile.constructEntityDescription(), projectile.objectID );
			}, this );

			// Construct entities
			fieldController.entities.forEach( function(key, entity)
			{
				this.entityDescription.setObjectForKey( entity.constructEntityDescription(), entity.objectID );
			}, this );
		}
	});
};

// Export
WorldEntityDescription = init();


