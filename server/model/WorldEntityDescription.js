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
			var entityDescription = new SortedLookupTable();
			var fieldController = aGameInstance.fieldController;

//			console.log( aGameInstance.fieldController );
			// Construct players
			fieldController.players.forEach( function(key, player)
			{
				entityDescription.setObjectForKey( player.constructEntityDescription(), player.objectID );
			}, this );

			// Construct projectiles
			fieldController.projectiles.forEach( function(key, projectile)
			{
				entityDescription.setObjectForKey( projectile.constructEntityDescription(), projectile.objectID );
			}, this );

			// Construct entities
			fieldController.entities.forEach( function(key, entity)
			{
				entityDescription.setObjectForKey( entity.constructEntityDescription(), entity.objectID );
			}, this );

			return entityDescription;
		}
	});
};

// Export
WorldEntityDescription = init();


