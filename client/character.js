function Character(game, controller) {
	this.game = game;
	this.controller = controller;
	this.element = this.createElement();
	this.x = this.game.getField().width() * Math.random();
	this.y = this.game.getField().height() * Math.random();
	
	this.speed = { x: 0, y: 0 };
	this.acceleration = { x: .1, y: .1 };
	this.resistance = { x: .05, y: .05 };
	this.maxSpeed = { x: 2, y: 2 };
}

$.extend( Character.prototype, {
	move: function() {
		this.x += this.speed.x;
		this.y += this.speed.y;
		
		if( this.game.getField().width() < this.x ) {
			this.x = -this.element.width();;
		} else if( this.x < -this.element.width() ) {
			this.x = this.game.getField().width();
		}
		
		if( this.y < -this.element.height() ) {
			this.y = this.game.getField().height();
		} else if( this.y > this.game.getField().height() ) {
			this.y = 0;
		}
		
		this.element.css({
			left: this.x,
			top: this.y
		});
	},
	
	logStats: function() {
		this.game.log( "Field Height: " + this.game.getField().height() );
		this.game.log( "Field Width: " + this.game.getField().width() );
		this.game.log( "X-Speed: " + this.speed.x );
		this.game.log( "Y-Speed: " + this.speed.y );
		this.game.log( "X: " + this.x );
		this.game.log( "Y: " + this.y );
		this.game.log( "Current Angle: " + this.rotation );
	},
	
	gravity: function() { 
		if( this.speed.x > 0 ) {
			if( this.speed.x < this.acceleration.x ) {
				this.speed.x = 0;
			} else {
				this.speed.x -= this.resistance.x;
			}
		} else if( this.speed.x < 0 ) {
			if( this.speed.x > -this.accelerationx ) {
				this.speed.x = 0;
			} else {
				this.speed.x += this.resistance.x;
			}
		}
		
		if( this.speed.y > 0 ) {
			if( this.speed.y < this.acceleration.y )  {
				this.speed.y = 0;
			} else { 
				this.speed.y -= this.resistance.y;
			}
		} else if( this.speed.y < 0 ) {
			if( this.speed.y > -this.acceleration.y ) {
				this.speed.y = 0;
			} else {
				this.speed.y += this.resistance.y;
			}
		}
	
	},
	
	calculateRotation: function() {
		if( this.controller.isKeyPressed() ) {
			this.rotation = Math.round( Math.abs( (180/Math.PI) * Math.atan2(this.speed.x,this.speed.y) - 180 ) );
			// this.rotation = (180/Math.PI) * Math.atan2(this.speed.x,this.speed.y);
		}
	},
	
	createElement: function() {
		return $('<div class="character"></div>')
			.appendTo( this.game.getField() );
	},
	
	tick: function() {
		if( this.controller.isLeft() && this.speed.x > -this.maxSpeed.x ) {
			this.speed.x-=this.acceleration.x;
		} else if( this.controller.isRight() && this.speed.x < this.maxSpeed.x ) {
			this.speed.x+=this.acceleration.x;
		}
		
		if( this.controller.isUp() && this.speed.y > -this.maxSpeed.y ) {
			this.speed.y-=this.acceleration.y;
		} else if( this.controller.isDown() && this.speed.y < this.maxSpeed.y ) {
			this.speed.y+=this.acceleration.y;
		}
		
		this.gravity();
		this.move();
		this.calculateRotation();
		
		this.logStats();
	},
	
	attachEvents: function() {
		var events = {
			click: function(e) {
				console.log('click', e.keyCode );
			},
			keypress: function(e) {
				console.log( 'down ', e.keyCode, " ", e );
			},
			
			keyup: function(e) {
	
			}
		};
	}
});