/**
File:
	Character Controller.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	A generic character inside of our multiplayer game.
	Anything too interesting should go in a subclass of this.

	Contains a view whic h is grabbed by the GameController and placed into
	the game controllers view
Basic Usage:
		var newCharacter = new CharacterController(aClientID, this.fieldRect);

		// Is this the users character?
		if(messageData.id == this.netChannel.clientID)
		{
			this.clientCharacter = newCharacter;
			this.joystick = new Joystick();
			console.log("(ClientGameController)", this.joystick);
		}

		// Grab the view from the character and add it to our GameView
		this.view.addCharacter(newCharacter.initView());
*/

define(['lib/jsclass-core', 'lib/Vector', 'lib/Rectangle', 'controllers/FieldController', 'controllers/entities/GameEntity', 'model/ProjectileModel'],
	function(JS, Vector, Rectangle, FieldController, GameEntity, ProjectileModel)
	{
		return new JS.Class(GameEntity,
		{
			/**
			 * @inheritDoc
			 */
			initialize: function(anObjectID, aClientID, aCharacterModel, aFieldController, config)
			{
				this.callSuper();

				this.entityType = this.config.ENTITY_MODEL.ENTITY_MAP.CHARACTER;			// Type

				// Override movement properties
				this.moveSpeed = 0.38;
				this.damping = 0.90;
				this.maxVelocity = 3.0;

				// Firing
				this.fireRate = 550;
				this.lastFireTime = 0;
				this.createView();

				this.rotationLocked = false;
				this.score = 0;
				this.rank = 0;
				this.lastScoreSent = 0;
				this.scoreMultiplier = 1;

				this.radius = 12.5;

				// Statistics
				this.stats = {};
				this.stats.ping = 0;
				this.stats.numberOfTimesDidHit = 0;
				this.stats.numberOfTimesWasHit = 0;
			},

			/**
			 * @inheritDoc
			 */
			tick: function(speedFactor, gameClock)
			{
				this.handleInput(gameClock);
				this.callSuper(speedFactor, gameClock);
			},

			/**
			 * @inheritDoc
			 */
			onCollision: function(ourCircle, otherCircle, collisionInverseNormal)
			{
	//			this.velocity.mul(0);
	//			this.fieldController.onCharacterWasHitByProjectile(ourCircle, otherCircle, collisionInverseNormal);
			},

			/**
			 * Handle keyboard Input
			 * Note: we allow the user to all keys at the same time
			 * Note: ClientControlledCharacter overrides this with a blank method!!!!!
			 */
			handleInput: function( gameClock )
			{
				if( this.input )
				{
					// Horizontal acceleration
					if( this.input.isLeft() ) this.acceleration.x -= this.moveSpeed;
					if( this.input.isRight() ) this.acceleration.x += this.moveSpeed;

					// Vertical movement
					if( this.input.isUp() ) this.acceleration.y -= this.moveSpeed;
					if( this.input.isDown() ) this.acceleration.y += this.moveSpeed;

					// Firing
					if( this.input.isSpace() ) this.fireProjectile( gameClock );

					this.rotationLocked = this.input.isShift();
				}
			},

			/**
			 * Causes character to attempt to fire a projectile.
			 * If not enough time has elapsed since the lastFireTime, the character will not fire
			 * @param {Number} gameClock GameControllers current clock value
			 */
			fireProjectile: function( gameClock )
			{
				if( gameClock - this.lastFireTime < this.fireRate) // Too soon
					return;

				// For now always fire the regular snowball
				var projectileModel = this.getProjectileModel();
				projectileModel.force = 1.0 ; // TODO: Use force gauge
				projectileModel.initialPosition = this.position.cp();
				projectileModel.initialPosition.y += 19; // half our height, this should be read instead of a magic number - TODO: remove magic number
				projectileModel.angle = this.rotation;// * 0.0174532925;

				var projectile = this.fieldController.fireProjectileFromCharacterUsingProjectileModel( this, projectileModel);
				this.lastFireTime = gameClock - (Math.random() * this.fireRate * 0.15);

				this.onProjectileFired(projectile);
				return projectile;
			},

			/**
			 * Return the type of projectile to throw, powerups should hi-jack this accessor in order to point to a different projectile type
			 */
			getProjectileModel: function()
			{
				return ProjectileModel.defaultSnowball
			},

			/**
			 * A projectile has been fired, allows us to do post init stuff to it.
			 * Mostly exist to allow traits to hi-jack this function
			 * @param projectile A projectile just fired by us
			 */
			onProjectileFired: function(projectile){},

			constructEntityDescription: function(gameTick, wantsFullUpdate)
			{
				//
				if(!wantsFullUpdate)
					wantsFullUpdate = (gameTick % 120) == 0;

				var returnString = this.callSuper(wantsFullUpdate);

				if(wantsFullUpdate || this.score != this.lastScoreSent) {
					returnString += ","+this.score;
					this.lastScoreSent = this.score;
				}

				if(wantsFullUpdate) {
					returnString += ","+this.model.nickname;
				}

				return returnString;
			},


	/**
	 * Accessors
	 **/
			/**
			 * Sets the joystick object that controls this character
			 * @param {Joystick} anInput A Joystick instance
			 */
			setInput: function( anInput )
			{
				this.input = anInput;
			},

			calculateRotation: function()
			{
				if(!this.rotationLocked)
					this.callSuper();
			}
		});
	}
);

