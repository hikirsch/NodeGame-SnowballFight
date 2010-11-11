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
	
	Contains a view which is grabbed by the GameController and placed into 
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
var init = function(Vector, Rectangle, CharacterView)
{
	return Class.extend({
		init: function(aClientID, aFieldRectangle) 
		{
			this.fieldRect = aFieldRectangle;
			
			this.view = null;
			
			// some defaults we use
			this.position = new Vector(Math.random() * this.fieldRect.width, Math.random() * this.fieldRect.height);
			this.prevPosition = new Vector();
			
			this.serverPosition = new Vector(this.position.x, this.position.y);
			
			// movement properties
			this.velocity = new Vector(0,0); // rolling velocity
			this.acceleration = new Vector(0, 0); // all combined forced. reset every tick
			
			// move constants
			this.moveSpeed = 0.7; 		// Apply to acceleration if keys pressed. Note, this number is high because it is applied multiplied by deltaTime
			
			this.maxVelocity = 3.5;		// the fastest i can go
			this.damping = 0.96;			// Bring velocity to 0 ( or near zero anyway :) ) over time
			
			this.rotation = 0; // we start pointing up, simply easy b/c of sprites right now
			this.clientID = aClientID;
		},
		
		setNickName: function( aNickName ) 
		{
			this.nickName = aNickName;
		},
		
		/**
		* Only called by ClientGameController
		*/
		initView: function()
		{
			this.view = new CharacterView(this);
			return this.view;
		},
		
		/*
		*	Handle keyboard Input
		*	Note we allow the user to all keys at the same time 
		*/
		handleInput:function(aJoystick)
		{
			// Horizontal acceleration
			if(aJoystick.isLeft()) this.acceleration.x -= this.moveSpeed;
			if(aJoystick.isRight()) this.acceleration.x += this.moveSpeed;
			
			// Vertical movement
			if(aJoystick.isUp()) this.acceleration.y -= this.moveSpeed;
			if(aJoystick.isDown()) this.acceleration.y += this.moveSpeed;
		},
		
		/**
		*	Update, use delta to create frame independent motion
		*/
		tick: function(speedFactor)
		{
			this.updatePosition(speedFactor);

			// if we have moved
			var shouldUpdateView = this.position.x != this.prevPosition.oldX || this.position.y != this.prevPosition.oldY;
			shouldUpdateView = true; // for now always
			
			if(shouldUpdateView && this.view) {
				this.view.updatePositionAndRotation(); 
			}
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
			
			this.rotation = 57.2957795 * Math.atan2(this.velocity.x,this.velocity.y) - 180;
			if(this.rotation < 0) this.rotation *= -1;  //avoid slow math.abs call
		},

		updatePosition: function(speedFactor)
		{
			// console.log('ClientID:'+this.clientID,'v:',Math.round(this.velocity.x*1000)/1000,'speedFactor:',Math.round(speedFactor*1000)/1000);
			// Store previous position
			this.prevPosition.x = this.position.x;
			this.prevPosition.y = this.position.y;
			
			// Adjust to speedFactor
			this.acceleration.mul(speedFactor);
			
			// Add acceleration to velocity and velocity to the current position
			this.velocity.add(this.acceleration);
			this.position.x += this.velocity.x * speedFactor;
			this.position.y += this.velocity.y * speedFactor;
			
			// Wrap horizontal
			if(this.position.x > this.fieldRect.width)
			{
				this.position.x = 0;
			}
			else if(this.position.x < 0)
			{ // use view width
				this.position.x = this.fieldRect.width;
			}
			
			// Wrap veritical
			if(this.y > this.fieldRect.height)
			{
				this.position.y = 0;
			}
			else if(this.y < 0)
			{
				this.position.y = this.fieldRect.height;
			}
			
			this.velocity.limit(this.maxVelocity);
			
			// Apply damping force
			this.velocity.x *= this.damping;
			this.velocity.y *= this.damping;
			
			this.calculateRotation();
			this.acceleration.x = this.acceleration.y = 0;
		},

		/*
		* Sets the rectangle of the field.
		* Tells the view so it can adjust itself
		* @param aRectangle A rectangle containing the fields rectangle
		*/
		setFieldRect: function(aRectangle)
		{
			this.fieldRect = aRectangle;
		}
	});
}

if (typeof window === 'undefined') {
	// We're in node!
	var Rectangle = require('../lib/Rectangle').Class;
	var Vector = require('../lib/Vector').Class;

	exports.Class = init(Vector, Rectangle);
} else {
	// We're on the browser. 
	// Require.js will use this file's name (CharacterController.js), to create a new  
	define(['lib/Vector', 'lib/Rectangle', 'view/Character'], init);
}