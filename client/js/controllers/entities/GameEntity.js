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

var init = function(Vector, Rectangle, FieldController)
{
	return new JS.Class(
	{
		initialize: function(anObjectID, aClientID, aFieldController)
		{
			console.log("(GameEntity)::initialize");
			
			this.fieldController = aFieldController;

			// Meta information
			this.entityType = 'GameEntity';			// Override in subclasses to
			this.clientID = aClientID;				// Client who created this object, 0 means it has no owner or the owner is the server
			this.objectID = anObjectID;				// Everything the server creates an object it assigns this number to it

			// Movement vector quantities
			this.position = new Vector();
			this.velocity = new Vector( 0, 0 );		// Rolling velocity
			this.acceleration = new Vector( 0, 0 );	// All combined forced. reset every tick

			// Movement scalar quantities
			this.damping = 0.96; 					// Bring velocity to 0 ( or near zero anyway :) ) over time
			this.rotation = 0;

			// Flags
			this.isCollidable = false;				// Objects can collide against us, but they might be able to go through us ( For example, a puddle )
			this.isFixed = false; 					// Objects cannot go through us if they collide (for example a tree)
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
				// Adjust to speedFactor
				this.acceleration.mul(speedFactor);

				// Add acceleration to velocity and velocity to the current position
				this.velocity.add(this.acceleration);
				this.updatePosition(speedFactor);
			}
		},

		updatePosition: function(speedFactor)
		{
			console.log("Velocity:", this.velocity, " Accel:", this.acceleration);
			
			// Store previous position
			var prevPosition = {
				x: this.position.x,
				y: this.position.y
			};

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

			this.velocity.limit(this.maxVelocity);

			// Apply damping force
			this.velocity.x *= this.damping;
			this.velocity.y *= this.damping;

			this.calculateRotation();
			this.acceleration.x = this.acceleration.y = 0;

			return ( this.position.x != prevPosition.x ) || ( this.position.y != prevPosition.y );
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
				x: this.position.x,
				y: this.position.y,
				vx: this.velocity.x,
				vy: this.velocity.y,
				r: this.rotation
			}
		},

		deconstructFromEntityDescription: function(anEntityDescription)
		{
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
	define(['lib/Vector', 'lib/Rectangle', 'controllers/FieldController', 'lib/jsclass/core'], init);
}