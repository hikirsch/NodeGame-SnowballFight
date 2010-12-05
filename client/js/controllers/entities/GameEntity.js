/**
File:
	Character Controller.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
 	Base Class for GameEntities

 	A lot of what im trying here comes from this:
	Valve Source SDK Network Entities
 	http://developer.valvesoftware.com/wiki/Networking_Entities

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

var init = function(Vector, Rectangle, FieldController, EntityView)
{
	return new JS.Class(
	{
		initialize: function(anObjectID, aClientID, aFieldController)
		{
			console.log("(GameEntity)::initialize - ");

			this.fieldController = aFieldController;

			// Meta information
			this.entityType = GAMECONFIG.ENTITY_MODEL.UNKNOWN;			// Type
			this.clientID = aClientID;				// Client who created this object, 0 means it has no owner or the owner is the server
			this.objectID = anObjectID;				// Everything the server creates an object it assigns this number to it

			// Movement vector quantities
			this.position = new Vector(-100, -100);
			this.velocity = new Vector( 0, 0 );		// Rolling velocity
			this.acceleration = new Vector( 0, 0 );	// All combined forced. reset every tick

			// Movement scalar quantities
			this.damping = 0.96; 					// Bring velocity to 0 ( or near zero anyway :) ) over time
			this.rotation = 0;

			// Flags
			this.collisionBitfield = 0;
			this.radius = 5;
//			this.isCollidable = false;				// Objects can collide against us, but they might be able to go through us ( For example, a puddle )
//			this.isFixed = false; 					// Objects cannot go through us if they collide (for example a tree)
		},


		/**
		 * Creates the field view, used by the AbstractClientGame
		 * @param aGameView
		 */
		createView: function()
		{
			// if our game has a view, then create one
			if( this.fieldController.hasView() )
			{
				this.view = new EntityView(this, 'smash-tv');
				console.log("creating entity view");
			}
		},

		/**
		 * Creates the event-listener function for handling collisions
		 * Note: This only is called on the server side
		 * @param aPackedCircle A PackedCircle which is tied to (and represents in the collision system) this entity
		 */
		setupCollisionEvents: function(aPackedCircle)
		{
			aPackedCircle.collisionBitfield = this.collisionBitfield;
			aPackedCircle.position = this.position;
			aPackedCircle.eventEmitter.on("collision", this.onCollision);
		},

		/**
		 * Based on the velocity that we're going at, we calculate the angle that we should be currently pointing at since
		 * we calculate our X and Y velocities separately.
		 */
		calculateRotation: function()
		{
			var combinedVelocity = this.velocity.x + this.velocity.y;
			// no change
			if(combinedVelocity > -0.1 && combinedVelocity < 0.1) return;

			this.rotation = 57.2957795 * Math.atan2(this.velocity.x, this.velocity.y) - 180;
			if(this.rotation < 0) this.rotation *= -1;
		},


		onCollision: function(ourCircle, otherCircle, collisionInverseNormal)
		{
			console.log('GOT IT!');
			otherCircle.view.position.mul(0);
		},
		
		/**
		 * Update, use delta to create frame independent motion
		 * @param speedFactor	A normalized value our ACTUAL framerate vs our desired framerate. 1.0 means exactly correct, 0.5 means we're running at half speed
		 * @param gameClock		The current gameclock
		 */
		tick: function(speedFactor, gameClock)
		{
			if(this.view)
			{
				this.view.update();
			}
			else
			{
				this.updatePosition(speedFactor);
			}
		},

		/**
		 * Updates the position of this gameentity based on it's movement properties (velocity, acceleration, damping)
		 * @param speedFactor Float for considering framerate speedFactor, 1.0 means perfectly accurate.
		 */
		updatePosition: function(speedFactor)
		{
			// Adjust to speedFactor
			this.acceleration.mul(speedFactor);

			// Add acceleration to velocity and velocity to the current position
			this.velocity.add(this.acceleration);

			this.position.x += this.velocity.x * speedFactor;
			this.position.y += this.velocity.y * speedFactor;

			// Wrap horizontal
			if(this.position.x > this.fieldController.getWidth()) {
				this.position.x = 0;
			} else if(this.position.x < 0) { // use view width
				this.position.x = this.fieldController.getWidth();
			}

			// Wrap veritical
			if(this.position.y > this.fieldController.getHeight()) {
				this.position.y = 0;
			} else if(this.position.y < 0) {
				this.position.y = this.fieldController.getHeight();
			}

			// Cap velocity
			this.velocity.limit(this.maxVelocity);

			// Apply damping force
			this.velocity.x *= this.damping;
			this.velocity.y *= this.damping;

			this.calculateRotation();
			this.acceleration.x = this.acceleration.y = 0;
		},


		getRotationToTheNearest: function( degrees )
		{
			return Math.floor(this.rotation / degrees) * degrees;
		},

		/**
		 * Net
		 */
		constructEntityDescription: function()
		{
			return {
				objectID: this.objectID,
				clientID: this.clientID,
				entityType: this.entityType,
				x: this.position.x,
				y: this.position.y,
				vx: this.velocity.x,
				vy: this.velocity.y,
				r: this.rotation
			}
		},

		deconstructFromEntityDescription: function(anEntityDescription)
		{
			// TODO: This does nothing now, but should be able to parse entity description and set up own properties
//			throw("All GameEntity subclasses must override this method.");
		},


		/**
		 * Accessors
		 */
		getRotation: function()
		{
			return this.rotation;
		},

		getPosition: function() {
			return this.position;
		},

		hasView: function()
		{
			return this.view != null;
		},

		getView: function()
		{
			if( ! this.view )
			{
				this.createView();
			}

			return this.view;
		}
	});
};

if (typeof window === 'undefined') {
	// We're in node!
	require('../../lib/jsclass/core.js');
	require('../../lib/Rectangle');
	require('../../lib/Vector');
	require('../FieldController');

	GameEntity = init(Vector, Rectangle, FieldController);
} else {
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector', 'lib/Rectangle', 'controllers/FieldController', 'view/EntityView', 'lib/jsclass/core'], init);
}