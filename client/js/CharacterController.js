var init = function(Vector, Rectangle, CharacterView)
{
	console.log(arguments);
	return Class.extend({
		init: function(aClientID, aFieldRectangle) 
		{
			this.fieldRect = aFieldRectangle;
			
			this.view = null;
			this.joystick = null;
			
			// some defaults we use
			this.position = new Vector();
			this.prevPosition = new Vector();
			
			this.velocity = new Vector(0,0); // how fast i am going
			this.acceleration = new Vector(0.1, 0.1); // how much i accelerate per tick
			this.damping = new Vector(0.33,0.33); // how much of a slide there is, how much do i take away per frame if there's no positive movement
			this.maxVelocity = new Vector(2.5, 2.5);  // the fastest i can go
			this.rotation = 0; // we start pointing up, simply easy b/c of sprites right now
			this.clientID = aClientID;
		},
		
		/**
		* Only called by ClientGameController
		*/
		initView: function()
		{
			this.view = new CharacterView(this);
			return this.view;
		},
		
		
		initJoystick: function()
		{
			this.joystick = new Joystick();
		},
		
		tick: function(gameClockTime)
		{
			this.calculateVelocity();
			this.calculateDamping();
			this.calculateRotation();
			this.updatePosition();

			// if we have moved
			var shouldUpdateView = this.position.x != this.prevPosition.oldX || this.position.y != this.prevPosition.oldY;
			shouldUpdateView = true; // for now always
			
			if(shouldUpdateView && this.view) {
				this.view.updatePositionAndRotation(); 
			}
		},
		
		/*
		*	Input
		*/
		/**
		 * If there are keys currently pressed, we either add or subtract from our velocity.
		 */
		calculateVelocity: function() {
			if( this.joystick.isLeft() && this.velocity.x > -this.maxVelocity.x ) {
				this.velocity.x-=this.acceleration.x;
			} else if( this.joystick.isRight() && this.velocity.x < this.maxVelocity.x ) {
				this.velocity.x+=this.acceleration.x;
			}
			
			if( this.joystick.isUp() && this.velocity.y > -this.maxVelocity.y ) {
				this.velocity.y-=this.acceleration.y;
			} else if( this.joystick.isDown() && this.velocity.y < this.maxVelocity.y ) {
				this.velocity.y+=this.acceleration.y;
			}
			
			console.log(this.velocity.x);
		},
		
		/**
		 * We need to slow down the character if they aren't actually moving anymore.
		 */
		calculateDamping: function() { 
			if( ! this.joystick.isHorizontalKeyPressed() ) {
				if( this.velocity.x > 0 ) {
					if( this.velocity.x < this.acceleration.x ) {
						this.velocity.x = 0;
					} else {
						this.velocity.x -= this.damping.x;
					}
				} else if( this.velocity.x < 0 ) {
					if( this.velocity.x > -this.acceleration.x ) {
						this.velocity.x = 0;
					} else {
						this.velocity.x += this.damping.x;
					}
				}
			}
			
			if( ! this.joystick.isVerticalKeyPressed() ) {
				if( this.velocity.y > 0 ) {
					if( this.velocity.y < this.acceleration.y )  {
						this.velocity.y = 0;
					} else { 
						this.velocity.y -= this.damping.y;
					}
				} else if( this.velocity.y < 0 ) {
					if( this.velocity.y > -this.acceleration.y ) {
						this.velocity.y = 0;
					} else {
						this.velocity.y += this.damping.y;
					}
				}
			}
		},
		
		/**
		 * Based on the velocity that we're going at, we calculate the angle that we should be currently pointing at since
		 * we calculate our X and Y velocities separately.
		 */
		calculateRotation: function() {
			if( this.joystick.isKeyPressed() )
			{
				this.rotation = 57.2957795 * Math.atan2(this.velocity.x,this.velocity.y);
				if(this.rotation < 0) this.rotation *= -1; // avoid slow abs call
				this.rotation -= 180; // offset
				this.rotation = 0;
				// this.rotation = (180/Math.PI) * Math.atan2(this.velocity.x,this.velocity.y); // this is really exacto ;-)
			}
		},
	

		updatePosition: function()
		{
			this.prevPosition.x = this.position.x;
			this.prevPosition.y = this.position.y;
			
			this.position.add(this.velocity);
		
			// Wrap horizontal
			if(this.position.x > this.fieldRect.width) {
				this.position.x = 0;
			} else if(this.position.x < 0) { // use view width
				this.position.x = this.fieldRect.width;
			}
			
			// Wrap veritical
			if(this.y > this.fieldRect.height) {
				this.position.y = 0;
			} else if(this.y < 0) {
				this.position.y = this.fieldRect.height;
			}
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
//	var sys = require("sys");
	var Vector = require('./lib/Vector').Class;
	var Rectangle = require('./lib/Rectangle').Class;
	
	console.log('Rectangle', new Rectangle(2, 2, 3, 3));
	exports.Class = init(Vector, Rectangle);
} else {
	// We're on the browser. 
	// Require.js will use this file's name (CharacterController.js), to create a new  
	define('CharacterController', ['lib/Vector', 'lib/Rectangle', 'CharacterView'], init);
}