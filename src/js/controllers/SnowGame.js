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


define([
		'lib/jsclass-core',
		'lib/bison',
		'lib/SortedLookupTable',
		'lib/Vector',
		'controllers/AbstractServerGame',
		'factories/TraitFactory',
		'model/ProjectileModel',
		'model/FieldEntityModel',
		'controllers/entities/traits/CharacterTraitInvulnerable'
	],

	function( JS, BISON, SortedLookupTable, Vector, AbstractServerGame, TraitFactory, ProjectileModel, FieldEntityModel, CharacterTraitInvulnerable )
	{
		return new JS.Class( AbstractServerGame,
		{
			initialize: function(config, portNumber)
			{
				this.callSuper();

				this.traitFactory = TraitFactory;

				// Listen for collisions
				var collisionManager = this.fieldController.getCollisionManager(),
					that = this;
				collisionManager.eventEmitter.on('collision', function() { that.onCollision.apply(that, arguments) });

				// Create the worlds best level of anything ever
				this.createLevel();
				this.initializePresents();

				console.log("(SnowGame)::initialize");
			},

			initializePresents: function()
			{
				this.presentsActive = new SortedLookupTable();
				this.presentsTimer = 0;
				this.presentsTotalSpawned = 0;
				this.spawnPresents();
			},

			/**
			 * Initialization
			 */
			createLevel: function()
			{
				// this.createDummyPlayers();
				var aFieldEntity,
					aFieldEntityModel;

				var rand = 3;//Math.floor(Math.random() * 2) + 1;

				var entities = this.levels[ Math.floor( this.levels.length * Math.random() ) ];

				for( var i = 0; i < entities.length; i++ ) {
					var nextEntity = entities[ i ];
					aFieldEntityModel = nextEntity.entityType;
					aFieldEntityModel.initialPosition = nextEntity.position;
					aFieldEntity = this.entityFactory.createFieldEntity(this.getNextEntityID(), 0, aFieldEntityModel, this.fieldController);

					var animateInTrait = TraitFactory.createTraitWithName('EntityTraitAnimateInFromAlpha');
					aFieldEntity.addTraitAndExecute( new animateInTrait() );

					this.fieldController.addEntity(aFieldEntity);
				}
			},

			/**
			 * OVERRIDES
			 */

			/**
			 * Calls super.shouldAddPlayer to create the character and attaches a Joystick to it
			 * @param anEntityID	An Entity ID for this Character, we created this right before this was called
			 * @param aClientID		Connection ID of the client
			 * @param aCharacterModel 	A character model
			 */
			shouldAddPlayer: function (anEntityID, aClientID, aCharacterModel)
			{
				var aNewCharacter = this.callSuper();
				if(aNewCharacter == null) return; // No charactnode node mainer created for whatever reason. Room full?

				// Place randomly in the field
				aNewCharacter.position = this.fieldController.positionEntityAtRandomNonOverlappingLocation(20);

				// Freeze players for 3 seconds if the game just started
				if(this.gameClock < 5000)
				{
					var Trait = this.traitFactory.createTraitWithName("ProjectileTraitFreeze");
					aNewCharacter.addTraitAndExecute( new Trait( new Vector(0,0), 4000 ) );

					/**
					 * Send that player a message to start its MatchStart animation
					 */
					var endGameMessage = {
						seq: 999,
						gameClock: this.gameClock,
						cmds: {
							cmd: this.config.CMDS.SERVER_MATCH_START,
							data: {}
						}
					};

					var clientConnection = this.netChannel.getClientWithID(aClientID);
					if(clientConnection) { // Can be null if we have dummy players
						clientConnection.conn.send( BISON.encode(endGameMessage) );
					}

				} else {
					// always make new characters invulnerable
					var characterTraitInvulnerable = TraitFactory.createTraitWithName('CharacterTraitInvulnerable');
					aNewCharacter.addTraitAndExecute( new characterTraitInvulnerable(2500) );
				}
				return aNewCharacter;
			},

			/**
			 * Events
			 */
			onCollision: function(circleA, circleB, collisionNormal)
			{
				// Debug, friendly name for when debugging
				var tAFriendly = this.config.ENTITY_MODEL.ENTITY_NAME_FRIENDLY[String(circleA.view.entityType)];
				var tBFriendly = this.config.ENTITY_MODEL.ENTITY_NAME_FRIENDLY[String(circleB.view.entityType)];

				var tList = this.config.ENTITY_MODEL.ENTITY_MAP;
				var tA = circleA.view.entityType;	// circleA entityType
				var tB = circleB.view.entityType;	// circleB entityType
				var tC = tA | tB;					// entityType of combined

				// [Character and Projectile]
				var character, projectile, fieldEntity;
				if(tC === (tList.CHARACTER | tList.PROJECTILE) )
				{
					character = (tA & tList.CHARACTER) ? circleA : circleB;
					projectile = (character === circleA)  ? circleB : circleA;


					// Give some points to the owner
					var projectileOwner = this.fieldController.getPlayerWithClientID(projectile.view.clientID);
					if(projectileOwner)
					{
						projectileOwner.score += (this.config.SCORING.HIT * projectileOwner.scoreMultiplier);
						projectileOwner.scoreMultiplier = Math.min(++projectileOwner.scoreMultiplier, this.config.SCORING.MAX_MULTIPLIER);

						// Reset the multiplier of the person who was hit
						character.view.scoreMultiplier = 1;

						// incriment stats
						character.view.stats.numberOfTimesWasHit++;
						projectileOwner.stats.numberOfTimesDidHit++;

					} else { // It's a present, (which also means it's owned by the server

						projectile.view.clientID = -1; // Set to clientID -1, which will cause it to be removed by connected clients
						this.presentsActive.remove(projectile.view.objectID);
					}


					// Apply the projectile's trait(s) to the character that was hit
					var Trait = this.traitFactory.createTraitWithName(projectile.view.transferredTraits);
						character.view.addTraitAndExecute( new Trait(collisionNormal) );

					this.fieldController.removeEntity(projectile.view.objectID);
				}
				// [Projectile vs FIELD_ENTITY]
				else if(tC === (tList.FIELD_ENTITY | tList.PROJECTILE) )
				{
					fieldEntity = (tA & tList.FIELD_ENTITY) ? circleA : circleB;
					projectile = (fieldEntity === circleA)  ? circleB : circleA;

					if(projectile.view.themeMask & this.config.SPRITE_THEME_MASK.DESTROY_ON_FIELD_ENTITY_HIT)
						this.fieldController.removeEntity(projectile.view.objectID);
					else if(projectile.view.themeMask & this.config.SPRITE_THEME_MASK.BOUNCE_ON_FIELD_ENTITY_HIT) {
						projectile.view.velocity.mul(-1);
						projectile.view.velocity.rotate(Math.random() * 0.2 + 0.2)
					}
				}
			},

			spawnPresents: function()
			{
				// restart the timer
				var that = this;
				var minTime = 1000;
				var timeRange = 5500;
				// TODO: Fix "chance" of present
				var chance = 0.25;
				clearTimeout(this.presentsTimer);
				this.presentsTimer = setTimeout( function() { that.spawnPresents()}, Math.random() * timeRange + minTime);


	//			Try to create if possible and luck says so
	//			console.log("Presents", this.presentsActive.count() >= this.config.PRESENTS_SETTING.PRESENTS_MAX )
				if(Math.random() < chance || this.presentsActive.count() >= this.config.PRESENTS_SETTING.PRESENTS_MAX )
					return;

				console.log("SPAWNING!");

				// Presents are really just projectiles that don't move
				// For now always fire the regular snowball
				var projectileModel = this.config.PROJECTILE_MODEL.present;
				projectileModel.force = 0 ; // TODO: Use force gauge
				projectileModel.initialPosition = this.fieldController.positionEntityAtRandomNonOverlappingLocation( 65 );
				projectileModel.angle = 0;
				projectileModel.transferredTraits = this.traitFactory.getRandomPresentTrait();

				// Seit to so that it goes to 1 of x random sprites in the sheet
				var numRows = this.config.ENTITY_MODEL.CAAT_THEME_MAP[projectileModel.theme].rowCount-1;
				projectileModel.theme = 400 + Math.floor( Math.random() * numRows+1 );

				// Create the present
				var present = this.entityFactory.createProjectile(this.getNextEntityID(), 0, projectileModel, this);
				this.fieldController.addEntity(present);

				var animateInTrait = TraitFactory.createTraitWithName('EntityTraitAnimateInFromLarge');
				console.log( "animateInTrait: ", animateInTrait );

				present.addTraitAndExecute( new animateInTrait() );

				// Add to our list
				this.presentsActive.setObjectForKey(present, present.objectID);
			},

			createDummyPlayers: function()
			{
				var allCharacterModels = [];
				for(var obj in this.config.CHARACTER_MODEL) {
					var model = this.config.CHARACTER_MODEL['snowman'];
					allCharacterModels.push(model);
				}

				for(var i = 0; i < 3; i++) {
					var index = Math.random() * allCharacterModels.length;
						index = Math.floor(index);

					var charModel = allCharacterModels[index];
					charModel.initialPosition = {x: Math.random() * this.model.width, y: Math.random() * this.model.height};

					var character = this.shouldAddPlayer(this.getNextEntityID(), this.netChannel.getNextClientID(), charModel);
					character.position.x = charModel.initialPosition.x;
					character.position.y = charModel.initialPosition.y;

					character.score = Math.floor(Math.random() * 9000)
				}
			},


			/**
			 * Levels
			 */

			getAllFieldEntitiesAsLevel: function()
			{
				return [
					{ position: { x: 100, y: 100 }, entityType: FieldEntityModel.gingerBreadHouse },
					{ position: { x: 250, y: 80 }, entityType: FieldEntityModel.blockOfIce1 },
					{ position: { x: 320, y: 80 }, entityType: FieldEntityModel.blockOfIce2 },
					{ position: { x: 380, y: 80 }, entityType: FieldEntityModel.blockOfIce3 },
					{ position: { x: 500, y: 80 }, entityType: FieldEntityModel.blockOfIce4 },
					{ position: { x: 620, y: 80 }, entityType: FieldEntityModel.blockOfIce5 },
					{ position: { x: 740, y: 80 }, entityType: FieldEntityModel.blockOfIce6 },
					{ position: { x: 100, y: 300 }, entityType: FieldEntityModel.iceMountainOgilvyFlag },
					{ position: { x: 300, y: 300 }, entityType: FieldEntityModel.iglooGreenFlag },
					{ position: { x: 550, y: 260 }, entityType: FieldEntityModel.lakeHorizontalBridge },
					{ position: { x: 760, y: 260 }, entityType: FieldEntityModel.lakeVerticalBridge },
					{ position: { x: 100, y: 500 }, entityType: FieldEntityModel.smallPond1 },
					{ position: { x: 230, y: 500 }, entityType: FieldEntityModel.smallPond2 },
					{ position: { x: 380, y: 500 }, entityType: FieldEntityModel.smallPond3 },
					{ position: { x: 580, y: 480 }, entityType: FieldEntityModel.largePond1 },
					{ position: { x: 780, y: 500 }, entityType: FieldEntityModel.iglooRedFlag }
				];
			},

			getBattlefield1: function()
			{
			  return [
					  { position: { x: 425, y: 120 }, entityType: FieldEntityModel.iceMountainOgilvyFlag },
					  { position: { x: 426, y: 15 }, entityType: FieldEntityModel.blockOfIce3 },
					  { position: { x: 326, y: 35 }, entityType: FieldEntityModel.blockOfIce3 },
					  { position: { x: 526, y: 35 }, entityType: FieldEntityModel.blockOfIce3 },
					  { position: { x: 50, y: 220 }, entityType: FieldEntityModel.blockOfIce1 },
					  { position: { x: 850, y: 300 }, entityType: FieldEntityModel.blockOfIce4 },
					  { position: { x: 226, y: 550 }, entityType: FieldEntityModel.blockOfIce2 },
					  { position: { x: 526, y: 350 }, entityType: FieldEntityModel.smallPond2 },

					  { position: { x: 650, y: 50 }, entityType: FieldEntityModel.brownReindeer },
					  { position: { x: 650, y: 200 }, entityType: FieldEntityModel.greenReindeer },
					  { position: { x: 650, y: 350 }, entityType: FieldEntityModel.candyCane },
					  { position: { x: 650, y: 550 }, entityType: FieldEntityModel.sleighInGround }
				  ];

			},

			levels: [
				[
					{ position: { x: 450, y: 275 }, entityType: FieldEntityModel.iceMountainOgilvyFlag },
					{ position: { x: 350, y: 225 }, entityType: FieldEntityModel.blockOfIce3 },
					{ position: { x: 550, y: 225 }, entityType: FieldEntityModel.blockOfIce3 },
					{ position: { x: 100, y: 100 }, entityType: FieldEntityModel.iglooGreenFlag },
					{ position: { x: 450, y: 170 }, entityType: FieldEntityModel.blockOfIce6 },
					{ position: { x: 50, y: 320 }, entityType: FieldEntityModel.blockOfIce1 },
					{ position: { x: 805, y: 520 }, entityType: FieldEntityModel.blockOfIce4 },
					{ position: { x: 226, y: 550 }, entityType: FieldEntityModel.blockOfIce2 },
					{ position: { x: 450, y: 540 }, entityType: FieldEntityModel.smallPond2 },
					{ position: { x: 750, y: 80 }, entityType: FieldEntityModel.blockOfIce1 },
					{ position: { x: 810, y: 250 }, entityType: FieldEntityModel.iglooRedFlag }
				],
				[
					{ position: { x: 136, y: 136 }, entityType: FieldEntityModel.iceMountainOgilvyFlag },
					{ position: { x: 263, y: 353 }, entityType: FieldEntityModel.gingerBreadHouse },
					{ position: { x: 103, y: 508 }, entityType: FieldEntityModel.blockOfIce5 },
					{ position: { x: 482, y: 300 }, entityType: FieldEntityModel.largePond1 },
					{ position: { x: 585, y: 106 }, entityType: FieldEntityModel.iglooRedFlag },
					{ position: { x: 455, y: 485 }, entityType: FieldEntityModel.blockOfIce4 },
					{ position: { x: 507, y: 135 }, entityType: FieldEntityModel.candyCane },
					{ position: { x: 507, y: 135 }, entityType: FieldEntityModel.candyCane },
					{ position: { x: 813, y: 77 }, entityType: FieldEntityModel.smallPond2 },
					{ position: { x: 766, y: 303 }, entityType: FieldEntityModel.blockOfIce5 },
					{ position: { x: 794, y: 513 }, entityType: FieldEntityModel.blockOfIce6 }
				],
				[
					{ position: { x: 295, y: 266 }, entityType: FieldEntityModel.largePond1 },
					{ position: { x: 756, y: 487 }, entityType: FieldEntityModel.largePond1 },
					{ position: { x: 529, y: 128 }, entityType: FieldEntityModel.iceMountainOgilvyFlag },
					{ position: { x: 769, y: 176 }, entityType: FieldEntityModel.gingerBreadHouse },
					{ position: { x: 160, y: 109 }, entityType: FieldEntityModel.blockOfIce6 },
					{ position: { x: 611, y: 360 }, entityType: FieldEntityModel.blockOfIce4 },
					{ position: { x: 116, y: 481 }, entityType: FieldEntityModel.iglooRedFlag },
					{ position: { x: 203, y:471 }, entityType: FieldEntityModel.candyCane }
				],
				[
					{ position: { x: 113, y: 181 }, entityType: FieldEntityModel.iceMountainOgilvyFlag },
					{ position: { x: 231, y: 122 }, entityType: FieldEntityModel.candyCane },
					{ position: { x: 396, y: 88 }, entityType: FieldEntityModel.iglooRedFlag },
					{ position: { x: 369, y: 258 }, entityType: FieldEntityModel.smallPond2 },
					{ position: { x: 494, y: 289 }, entityType: FieldEntityModel.gingerBreadHouse },
					{ position: { x: 777, y: 149 }, entityType: FieldEntityModel.largePond1 },
					{ position: { x: 147, y: 465 }, entityType: FieldEntityModel.largePond1 },
					{ position: { x: 648, y: 460 }, entityType: FieldEntityModel.candyCane },
					{ position: { x: 766, y: 496 }, entityType: FieldEntityModel.iglooRedFlag }
				]
			],

			shouldEndGame: function()
			{
				this.callSuper();
			},

			dealloc: function()
			{
				clearTimeout( this.presentsTimer );
				this.callSuper();
			}
		});
	}
);
