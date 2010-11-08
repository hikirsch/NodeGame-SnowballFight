/**
 * A helper class to detect the current state of the controls of the game. 
 */
function Joystick(game) {
	this.keyCodes = { '37': 'left', '38': 'up', '39': 'right', '40': 'down' };
	this.keys = {};
	this.keyPressed = 0;
	
	this.attachEvents();
};

$.extend(Joystick.prototype, {
	/**
	 * We don't care about a time clock here, we attach events, we only want
	 * to know if something's happened.
	 */
	attachEvents: function() {
		var that = this;
	
		$('html').live({
			
			keydown: function( e ) {
				if( e.keyCode in that.keyCodes ) {
					// if we're already pressing down on the same key, then we don't want to increment
					// our key pressed count
					if( ! that.keys[ that.keyCodes[ e.keyCode ] ] ) { 
						that.keyPressed++;
					}
					that.handler( e.keyCode, true );
				};
			},
			
			keyup: function( e ) {
				if( e.keyCode in that.keyCodes ) {
					that.handler( e.keyCode, false );
					that.keyPressed--;
				};
				
			}
		});
	},
	
	/** 
	 * Map it to something useful so we know what it is
	 */
	handler: function( keyCode, enabled ) {
		this.keys[ this.keyCodes[ keyCode] ] = enabled;
	},
	
	/**
	 * Just figure out whether or not I have any keys currently pressed.
	 */
	isKeyPressed: function() {
		return this.keyPressed > 0;
	},
	
	/**
	 * Some helper methods to find out if we're going in a specific direction
	 */
	isLeft: function() { return this.keys['left']; },
	isUp: function() { return this.keys['up']; },
	isRight: function() { return this.keys['right']; },
	isDown: function() { return this.keys['down']; }
});