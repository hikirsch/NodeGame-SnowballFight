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
require('js/factories/TraitFactory');
SnowGame = (function()
{
	return new JS.Class(AbstractServerGame, {
		initialize: function(aServer, gameModel)
		{
			this.callSuper();
			var that = this;

			this.traitFactory = TraitFactory;

			// Listen for collisions
			var collisionManager = this.fieldController.getCollisionManager();
			collisionManager.eventEmitter.on('collision', function() { that.onCollision.apply(that, arguments) });

			// Create the worlds best level of anything ever
			this.createLevel();
		},

		onCollision: function(circleA, circleB, collisionNormal)
		{
			// Debug, friendly name for when debugging
			var tAFriendly = EntityModel.ENTITY_NAME_FRIENDLY[String(circleA.view.entityType)];
			var tBFriendly = EntityModel.ENTITY_NAME_FRIENDLY[String(circleB.view.entityType)];

			var tList = EntityModel.ENTITY_MAP;
			var tA = circleA.view.entityType;	// circleA entityType
			var tB = circleB.view.entityType;	// circleB entityType
			var tC = tA | tB;					// entityType of combined

			// [Character and Projectile]
			var character, projectile, fieldEntity;
			if(tC === (tList.CHARACTER | tList.PROJECTILE) ) {
				character = (tA & tList.CHARACTER) ? circleA : circleB;
				projectile = (character === circleA)  ? circleB : circleA;


				// Apply the projectile's trait(s)
				var Trait = this.traitFactory.createTraitWithName(projectile.view.transferredTraits);
				character.view.addTraitAndExecute( new Trait(collisionNormal) );

				// Remove the projectile
				this.fieldController.removeEntity(projectile.view.objectID);
			}
			// [Projectile vs FIELD_ENTITY]
			else if(tC === (tList.FIELD_ENTITY | tList.PROJECTILE) ) {
				fieldEntity = (tA & tList.FIELD_ENTITY) ? circleA : circleB;
				projectile = (fieldEntity === circleA)  ? circleB : circleA;
				this.fieldController.removeEntity(projectile.view.objectID);
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
			];

 			for( var i = 0; i < entities.length; i++ ) {
				var nextEntity = entities[ i ];
				aFieldEntityModel = nextEntity.entityType;
				aFieldEntityModel.initialPosition = nextEntity.position;
				aFieldEntity = this.entityFactory.createFieldEntity(this.getNextEntityID(), 0, aFieldEntityModel, this.fieldController);
				this.fieldController.addEntity(aFieldEntity);
			}
		}
	});
})();
