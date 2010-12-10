/**
 File:
 	WorldEntityDescription.js
 Created By:
 	Mario Gonzalez
 Project:
 	Ogilvy Holiday Card 2010
 Abstract:
	A world entity description is a full description of the current world state.

 	AbstractServerGame creates this each 'tick'
 		-> NetChannel passes it to each Client
 			-> Each client does 'delta compression' (removes unchanged stuff)
 				-> If ready, each client sends the customized WorldEntityDescription to it's connection
 Basic Usage:
	// Create a new world-entity-description, could be some room for optimization here but it only happens once per game loop anyway
	var worldEntityDescription = new WorldEntityDescription( this );
	this.netChannel.tick( this.gameClock, worldEntityDescription );
 */
require('js/lib/jsclass/core.js');
require('js/lib/SortedLookupTable.js');
require('js/controllers/entities/GameEntity');

WorldEntityDescription = (function()
{
	return new JS.Class(
	{
		initialize: function( aGameInstance )
		{
			var fieldController = aGameInstance.fieldController;
			this.entities = "";
			this.gameClock = aGameInstance.gameClock;
			this.gameTick = aGameInstance.gameTick;
			
			// Construct players
			fieldController.allEntities.forEach( function(key, entity)
			{
				this.entities += entity.constructEntityDescription();
			}, this );
		}
	});
})();

