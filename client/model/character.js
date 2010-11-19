/**
 * A character is simply a participant. Someone who is on the board and is playing the game.
 * This is the player and their controls will affect what this character will do in the game.
 */
function Character(game, controller, nickName ) {
	// the game this character is taking place in, we run around this place.
	this.game = game;
	
	// helps us figure out which keys are currently pressed
	this.controller = controller;
	
	// some defaults we use
	this.velocity = { x: 0, y: 0 }; // how fast i am going
	this.acceleration = { x: .1, y: .1 }; // how much i accelerate per tick
	this.damping = { x: .033, y: .033 }; // how much of a slide there is, how much do i take away per frame if there's no positive movement
	this.maxVelocity = { x: 2.5, y: 2.5 };  // the fastest i can go
	this.rotation = 0; // we start pointing up, simply easy b/c of sprites right now
	
	this.nickName = nickName;
	
	// create our physical character
	this.createElement();
	
	// start in a random location
	this.x = this.game.getField().width() * Math.random();
	this.y = this.game.getField().height() * Math.random();
	
	// 8 Images representing directions
	this.element.addClass( 'smash-tv' );
	
	// our default position is north
	this.currentSpriteClass = '0';
};

$.extend( Character.prototype, {
	
	/**
	 * Create's the actual HTML element that is used for this game
	 */
	createElement: function() {
		this.element =  $('<div class="character"><p>' + this.nickName + '</p></div>')
			.appendTo( this.game.getField() );
	},
	
	destroy: function() {
		this.element.remove();
	},
	
	/**
	 * A new frame has come into play, lets move our character.
	 */
	tick: function() {
		this.move();
		this.logStats();
	},
	
	update: function( data ) {
		this.x = data.x;
		this.y = data.y;
		this.rotation = data.rotation;
		this.calculatePosition();
		this.adjustSprite();
	},
	
	/**
	 * There are quite a few things that have to be done in order to move this character around.
	 */
	move: function() {
		this.calculateVelocity();
		this.calculateDamping();
		this.calculateRotation();
		this.calculatePosition();
		this.adjustSprite();
		this.updateGame();
	},
	
	/**
	 * If there are keys currently pressed, we either add or subtract from our velocity.
	 */
	calculateVelocity: function() {
		if( this.controller.isLeft() && this.velocity.x > -this.maxVelocity.x ) {
			this.velocity.x-=this.acceleration.x;
		} else if( this.controller.isRight() && this.velocity.x < this.maxVelocity.x ) {
			this.velocity.x+=this.acceleration.x;
		}
		
		if( this.controller.isUp() && this.velocity.y > -this.maxVelocity.y ) {
			this.velocity.y-=this.acceleration.y;
		} else if( this.controller.isDown() && this.velocity.y < this.maxVelocity.y ) {
			this.velocity.y+=this.acceleration.y;
		}
	},
	
	/**
	 * We need to slow down the character if they aren't actually moving anymore.
	 */
	calculateDamping: function() { 
		if( ! this.controller.isHorizontalKeyPressed() ) {
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
		
		if( ! this.controller.isVerticalKeyPressed() ) {
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
		if( this.controller.isKeyPressed() )
		{
			var rotationFloat = (180/Math.PI) * Math.atan2(this.velocity.x,this.velocity.y) - 180
			if(rotationFloat < 0) rotationFloat = -rotationFloat;

			this.rotation = rotationFloat << 0;
			// this.rotation = (180/Math.PI) * Math.atan2(this.velocity.x,this.velocity.y); // this is really exacto ;-)
		}
	},
	
	/**
	 * This will calculate and place the HTML element into the new position that it should be in,
	 * this is based on their current velocity and the field size.
	 */
	calculatePosition: function() {
		this.oldX = this.x;
		this.oldY = this.y;
		
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		
		if( this.game.getField().width() < this.x ) {
			this.x = -this.element.width();;
		} else if( this.x < -this.element.width() ) {
			this.x = this.game.getField().width();
		}
		
		if( this.y < -this.element.height() ) {
			this.y = this.game.getField().height();
		} else if( this.y > this.game.getField().height() ) {
			this.y = -this.element.height();
		}
		
		this.element.css({
			left: this.x,
			top: this.y
		});
	},
	
	/**
	 * Based on our rotation, we should show a different sprite.
	 */
	adjustSprite: function() {
		var spriteRotation = Math.floor(this.rotation / 45) * 45;
		$(this.element)
			.removeClass( 'rotation-' + this.currentSpriteClass )
			.addClass( 'rotation-' + spriteRotation );
			
		this.currentSpriteClass = spriteRotation;
	},
	
	updateGame: function() {
		// if we have moved
		if( this.x != this.oldX || this.y != this.oldY ) {
			this.game.characterUpdate( this );
		}
	},
	
	/**
	 * i <3 helpers :-)
	 */
	logStats: function() {
		this.game.log( "Nickname: " + this.game.getNickName() );
		this.game.log( "Field Height: " + this.game.getField().height() );
		this.game.log( "Field Width: " + this.game.getField().width() );
		this.game.log( "X-Velocity: " + this.velocity.x );
		this.game.log( "Y-Velocity: " + this.velocity.y );
		this.game.log( "X: " + this.x );
		this.game.log( "Y: " + this.y );
		this.game.log( "Current Angle: " + this.rotation );
		this.game.log( "Current Sprite: " + this.currentSpriteClass );
		this.game.log( "Is Key Pressed: " + this.controller.isKeyPressed() );
		//console.log( "InnerHTML: " + this.element.innerHTML );
	}
});