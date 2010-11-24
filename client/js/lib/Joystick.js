/**
 * A helper class to detect the current state of the controls of the game. 
 */

var init = function($)
{
	return new JS.Class(
	{
		initialize: function()
		{
			this.keyCodes = { '32': 'space', '37': 'left', '38': 'up', '39': 'right', '40': 'down'},
			this.keys = {'up': false, 'down': false, 'left': false, "right": false },
			this.keyPressed = 0;
		},

		/**
		 * We don't care about a time clock here, we attach events, we only want
		 * to know if something's happened.
		 */

		attachEvents: function()
		{
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
					}
				},
	
				keyup: function( e ) {
					if( e.keyCode in that.keyCodes ) {
						that.handler( e.keyCode, false );
						that.keyPressed--;
					}
				}
			});
		},

		isKeyPressed: function() {
			return this.keyPressed > 0;
		},

		/**
		 * Map it to something useful so we know what it is
		 */
		handler: function( keyCode, enabled ) {
			this.keys[this.keyCodes[ keyCode] ] = enabled;
		},

		/**
		 * Some helper methods to find out if we're going in a specific direction
		 */
		isLeft: function() { return this.keys['left'];},
		isUp: function() { return this.keys['up']; },
		isRight: function() { return this.keys['right']; },
		isDown: function() { return this.keys['down']; },
		isSpace: function() { return this.keys['space']; }
	});
};

if (typeof window === 'undefined') {	// We're in node!
	Joystick = init(null);
} else {
	define(['jquery'], init);
}