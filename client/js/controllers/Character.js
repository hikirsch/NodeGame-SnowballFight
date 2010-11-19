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
		init: function(aClientID, controller, initView) 
		{
			this.fieldController = controller;
			this.clientID = aClientID;

			// some defaults we use for position
			this.position = new Vector( Math.random() * this.fieldController.getWidth(), Math.random() * this.fieldController.getHeight() );
			this.serverPosition = new Vector( this.position.x, this.position.y );
			
			// movement properties
			this.velocity = new Vector( 0, 0 ); // rolling velocity
			this.acceleration = new Vector( 0, 0 ); // all combined forced. reset every tick
			
			// move constants
			// Apply to acceleration if keys pressed. Note, this number is high because it is applied multiplied by deltaTime
			this.moveSpeed = 0.7; 
			
			// the fastest i can go
			this.maxVelocity = 3.5;
			
			// Bring velocity to 0 ( or near zero anyway :) ) over time
			this.damping = 0.96; 
			
			// we start pointing up, simply easy b/c of sprites right now
			this.rotation = 0; 
			
			// if the field we're being placed in has a field, then we'll go into it
			if( this.fieldController.view )
			{
				// init the view, pass ourselves as the controller
				this.view = new CharacterView( this, 'smash-tv' );
			}
		},
		
		getNickName: function() 
		{
			return this.nickName;
		},
		
		setNickName: function( newNickName ) 
		{
			this.nickName = newNickName;

			if(this.view)
				this.view.refresh();
		},
		
		getRotation: function() 
		{
			return this.rotation;
		},
		
		getPosition: function() {
			return this.position;
		},
		
		getStatus: function() {
			return { 
				x: this.position.x, 
				y: this.position.y,
				vx: this.velocity.x, 
				vy: this.velocity.y,
				r: this.rotation
			}
		},
		
		setInput: function( input ) 
		{
			this.input = input;
		},
		
		/**
		 * Handle keyboard Input
		 * Note we allow the user to all keys at the same time 
		 */
		handleInput: function()
		{
			if( this.input ) 
			{
				// Horizontal acceleration
				if( this.input.isLeft() ) this.acceleration.x -= this.moveSpeed;
				if( this.input.isRight() ) this.acceleration.x += this.moveSpeed;
			
				// Vertical movement
				if( this.input.isUp() ) this.acceleration.y -= this.moveSpeed;
				if( this.input.isDown() ) this.acceleration.y += this.moveSpeed;
			}
		},


		/**
		 * Update, use delta to create frame independent motion
		 * @param speedFactor	A normalized value our ACTUAL framerate vs our desired framerate. 1.0 means exactly correct, 0.5 means we're running at half speed 
		 */
		tick: function(speedFactor)
		{
			if( this.input ) {
				this.handleInput();
			}
			
			var didMove = this.calcuatePosition(speedFactor);
			
			if(didMove && this.view) {
				this.view.update();
			}
		},
		
		getRotationToTheNearest: function( degrees ) 
		{
			return Math.floor(this.rotation / degrees) * degrees;
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
			if(this.rotation < 0) this.rotation *= -1;  //avoid slow math.abs call
		},

		calcuatePosition: function(speedFactor)
		{
			// console.log('ClientID:'+this.clientID,'v:',Math.round(this.velocity.x*1000)/1000,'speedFactor:',Math.round(speedFactor*1000)/1000);
			// Store previous position
			var prevPosition = {
				x: this.position.x,
				y: this.position.y
			};
			
			// Adjust to speedFactor
			this.acceleration.mul(speedFactor);
			
			// Add acceleration to velocity and velocity to the current position
			this.velocity.add(this.acceleration);
			this.position.x += this.velocity.x * speedFactor;
			this.position.y += this.velocity.y * speedFactor;
			
			// Wrap horizontal
			if(this.position.x > this.fieldController.getWidth())
			{
				this.position.x = 0;
			}
			else if(this.position.x < 0)
			{ // use view width
				this.position.x = this.fieldController.getWidth();
			}
			
			// Wrap veritical
			if(this.position.y > this.fieldController.getHeight())
			{
				this.position.y = 0;
			}
			else if(this.position.y < 0)
			{
				this.position.y = this.fieldController.getHeight();
			}
			
			this.velocity.limit(this.maxVelocity);
			
			// Apply damping force
			this.velocity.x *= this.damping;
			this.velocity.y *= this.damping;
			
			this.calculateRotation();
			this.acceleration.x = this.acceleration.y = 0;
			
			return ( this.position.x != prevPosition.x ) || ( this.position.y != prevPosition.y );
		}
	});
}

if (typeof window === 'undefined')
{
	// We're in node!
	var Rectangle = require('../lib/Rectangle').Class;
	var Vector = require('../lib/Vector').Class;

	exports.Class = init(Vector, Rectangle );
}
else
{
	// We're on the browser. 
	// Require.js will use this file's name (CharacterController.js), to create a new  
	define(['lib/Vector', 'lib/Rectangle', 'view/Character'], init);
}