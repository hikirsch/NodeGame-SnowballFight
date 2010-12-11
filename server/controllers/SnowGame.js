/**
File:
	ServerGameController.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
 	This is the servers version of AbstractGame.js / it contains and controls the parts that any ServerGame instance would need in order to function
Basic Usage: 
	var gameController = new ServerGameController({
	    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
	    'status': false,
	    'recordFile': './../record[date].js',
	    'record': false,
	    'server': null
	});
	gameController.run();
	
Version:
	1.0
*/

require('controllers/AbstractServerGame');
SnowGame = (function()
{
	return new JS.Class(AbstractServerGame, {
		initialize: function(aServer, gameModel)
		{
			this.callSuper();
			var that = this;
			var collisionManager = this.fieldController.getCollisionManager();
			collisionManager.eventEmitter.on('collision', function() { that.onCollision.apply(that, arguments) });
			this.createLevel();
		},

		onCollision: function(circleA, circleB, collisionNormal)
		{
//			Messy for now, but call proper function on collision

			// Player vs projectile collision occured
			if( (circleA.view.entityType === EntityModel.CHARACTER || circleB.view.entityType === EntityModel.CHARACTER) &&
				(circleA.view.entityType === EntityModel.PROJECTILE || circleB.view.entityType === EntityModel.PROJECTILE))
			{
				var player = (circleA.view.entityType === EntityModel.CHARACTER) ? circleA.view : circleB.view;
				var projectile = (circleA.view.entityType === EntityModel.PROJECTILE) ? circleA.view : circleB.view;
				this.fieldController.removeEntity(projectile.objectID);
			}
		},

		createLevel: function()
		{
			var aFieldEntity,
				aFieldEntityModel;

			//blockOfIce
			for (var i = 0; i < 1; i++)
			{
				aFieldEntityModel = FieldEntityModel.gingerBreadHouse;
				aFieldEntityModel.initialPosition = {x: 400, y: 300 };
				aFieldEntity = this.entityFactory.createFieldEntity(this.getNextEntityID(), 0, aFieldEntityModel, this.fieldController)
				console.gameLog('creating entity');
				this.fieldController.addEntity(aFieldEntity);
			}


		}
	});
})();
