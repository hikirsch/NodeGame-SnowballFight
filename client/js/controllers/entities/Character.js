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
		initialize: function(anObjectID, aClientID, aFieldController)
		{
			this.callSuper();
			this.entityType = GAMECONFIG.ENTITY_MODEL.CHARACTER;			// Type

			// some defaults we use for position
			this.position = new Vector(-100, -100);

			// move constants
			// Apply to acceleration if keys pressed. Note, this number is high because it is applied multiplied by deltaTime
			this.moveSpeed = 0.2;
			this.maxVelocity = 3.5; // the fastest i can go

			this.createView();

			// Firing
			this.fireRate = 500;
			this.lastFireTime = 0;
		},

		createView: function()
		{
			// if our game has a view, then create one
			if( this.fieldController.hasView() )
			{
				this.view = new CharacterView(this, 'smash-tv');
				console.log("creating character view");
			}
		},

		/**
		 * @inherit
		 */
		tick: function(speedFactor, gameClock)
		{
			this.handleInput(gameClock);
			this.callSuper(speedFactor, gameClock);
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
				if( this.input.isSpace() )
					this.fireProjectile( gameClock );
			}
		},

		fireProjectile: function( gameClock )
		{
			if( gameClock - this.lastFireTime < this.fireRate) // Too soon
				return;


			// For now always fire the regular snowball
			var projectileModel = ProjectileModel.defaultSnowball;
			projectileModel.force = 1.0 ; // TODO: Use force gauge
			
			this.fieldController.fireProjectileFromCharacterUsingProjectileModel( this, projectileModel);
			this.lastFireTime = gameClock;
		},



//
//		deconstructFromEntityDescription: function(anEntityDescription)
//		{
//			throw("All GameEntity subclasses must override this method.");
//		},

		/**
		 * Accessors
		 */
		getNickName: function()
		{
			return this.nickName;
		},

		setNickName: function( aNickName )
		{
			this.nickName = aNickName;

			if(this.view)
				this.view.refresh();
		},

		setInput: function( anInput )
		{
			this.input = anInput;
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