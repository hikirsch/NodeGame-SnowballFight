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

			var entities = [
				{ position: { x: 100, y: 100 }, entityType: FieldEntityModel.gingerBreadHouse },
				{ position: { x: 250, y: 100 }, entityType: FieldEntityModel.blockOfIce1 },
				{ position: { x: 350, y: 100 }, entityType: FieldEntityModel.blockOfIce2 },
				{ position: { x: 500, y: 100 }, entityType: FieldEntityModel.blockOfIce3 },
				{ position: { x: 700, y: 100 }, entityType: FieldEntityModel.blockOfIce4 },
				{ position: { x: 100, y: 300 }, entityType: FieldEntityModel.iceMountainOgilvyFlag },
				{ position: { x: 320, y: 300 }, entityType: FieldEntityModel.iglooGreenFlag } ,
				{ position: { x: 500, y: 300 }, entityType: FieldEntityModel.lakeHorizontalBridge },
				{ position: { x: 740, y: 300 }, entityType: FieldEntityModel.lakeVerticalBridge },
				{ position: { x: 100, y: 500 }, entityType: FieldEntityModel.smallPond }
			]

 			for( var i = 0; i < entities.length; i++ ) {
				var nextEntity = entities[ i ];
				aFieldEntityModel = nextEntity.entityType;
				aFieldEntityModel.initialPosition = nextEntity.position;
				aFieldEntity = this.entityFactory.createFieldEntity(this.getNextEntityID(), 0, aFieldEntityModel, this.fieldController)
				this.fieldController.addEntity(aFieldEntity);
			}
		}
	});
})();
