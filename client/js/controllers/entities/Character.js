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

var init = function(Vector, Rectangle, FieldController, GameEntity, ProjectileModel, Projectile, CharacterView)
{
	return new JS.Class(GameEntity,
	{
		/**
		 * @inheritDoc
		 */
		initialize: function(anObjectID, aClientID, aFieldController)
		{
			this.callSuper();
			this.entityType = GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.CHARACTER;			// Type

			// Override movement properties
			this.moveSpeed = 0.4;
			this.damping = 0.96;
			this.maxVelocity = 3.5;

			// Firing
			this.fireRate = 500;
			this.lastFireTime = 0;

			this.createView();
		},

		/**
		 * Creates the 'View' for this character
		 * This should only be called client side.
		 * Will throw an error if the field controller does not contain a view
		 */
		createView: function()
		{
			// if our game has a view, then create one
			if( this.fieldController.hasView() ) {
				this.view = new CharacterView(this, 'smash-tv');
			}
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
			var projectileModel = ProjectileModel.defaultSnowball;
			projectileModel.force = 1.0 ; // TODO: Use force gauge
			projectileModel.initialPosition = this.position.cp();
			projectileModel.angle = this.rotation;// * 0.0174532925;

			this.fieldController.fireProjectileFromCharacterUsingProjectileModel( this, projectileModel);
			this.lastFireTime = gameClock;
		},

		/**
		 * Accessors
		 */
		/**
		 * return {String} This characters nickname
		 */
		getNickName: function()
		{
			return this.nickName;
		},

		/**
		 * Sets the nickname of a particular client, should contain a view already
		 * @param {String} aNickName
		 */
		setNickName: function( aNickName )
		{
			this.nickName = aNickName;

			if(this.view)
				this.view.refresh();
		},

		setInput: function( anInput )
		{
			this.input = anInput;
		},

		/**
		 * Deallocation
		 */
		dealloc: function()
		{
			this.callSuper();
		}
	});
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('../../lib/jsclass/core.js');
	require('../../lib/Vector');
	require('../../lib/Rectangle');
	require('../FieldController');
	require('../../model/ProjectileModel');
	require('./Projectile');
	require('./GameEntity');

	Character = init(Vector, Rectangle, FieldController, GameEntity, ProjectileModel, Projectile, undefined);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name to
	define(['lib/Vector',
		'lib/Rectangle',
		'controllers/FieldController',
		'controllers/entities/GameEntity',
		'model/ProjectileModel',
		'controllers/entities/Projectile',
		'view/CharacterView',
		'lib/jsclass/core'], init);
}