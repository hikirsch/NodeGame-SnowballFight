/**
 * A helper class to detect the current state of the controls of the game. 
 */

// TODO: ADD JQUERY TO JOYSTICK!
define(['lib/jsclass-core'], function(JS) {
	return new JS.Class(
	{
		initialize: function()
		{
			this.keyCodes = { '16': 'shift', '32': 'space', '37': 'left', '38': 'up', '39': 'right', '40': 'down', '9': 'tab'},
			this.keys = {'tab': false, 'shift': false, 'space': false, 'up': false, 'down': false, 'left': false, "right": false },
			this.keyPressed = 0;

		},

		keydown: function ( e ) {
			if( e.keyCode in that.keyCodes ) {
				// if we're already pressing down on the same key, then we don't want to increment
				// our key pressed count
				if( ! that.keys[ that.keyCodes[ e.keyCode ] ] ) {
					that.keyPressed++;
				}
				that.handler( e.keyCode, true );
				e.preventDefault();
			}
		},

		keyup: function( e ) {
			if( e.keyCode in that.keyCodes ) {
				that.handler( e.keyCode, false );
				that.keyPressed--;
				e.preventDefault();
			}
		},

		/**
		 * Attach events to the HTML element
		 * We don't care about a time clock here, we attach events, we only want
		 * to know if something's happened.
		 */
		attachEvents: function()
		{
			var that = this;
			document.attachEvent('onkeydown', function(e) { that.keydown(e); });
			document.attachEvent('onkeyup', function(e) { that.keyup(e); });
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
		 * Constructs a bitmask based on current keyboard state
		 * @return A bitfield containing input states
		 */
		constructInputBitmask: function()
		{
			var input = 0;

			// Check each key
			if(this.keys['up']) input |= GAMECONFIG.INPUT_BITMASK.UP;
			if(this.keys['down']) input |= GAMECONFIG.INPUT_BITMASK.DOWN;
			if(this.keys['left']) input |= GAMECONFIG.INPUT_BITMASK.LEFT;
			if(this.keys['right']) input |= GAMECONFIG.INPUT_BITMASK.RIGHT;
			if(this.keys['space']) input |= GAMECONFIG.INPUT_BITMASK.SPACE;
			if(this.keys['shift']) input |= GAMECONFIG.INPUT_BITMASK.SHIFT;
			if(this.keys['tab']) input |= GAMECONFIG.INPUT_BITMASK.TAB;
			return input;
		},


		/**
		 * Sets the 'key down' properties based on an input mask
		 * @param inputBitmask 	A bitfield containing input flags
		 */
		deconstructInputBitmask: function(inputBitmask)
		{
			this.keys['up'] = (inputBitmask & GAMECONFIG.INPUT_BITMASK.UP);
			this.keys['down'] = (inputBitmask & GAMECONFIG.INPUT_BITMASK.DOWN);
			this.keys['left'] = (inputBitmask & GAMECONFIG.INPUT_BITMASK.LEFT);
			this.keys['right'] = (inputBitmask & GAMECONFIG.INPUT_BITMASK.RIGHT);
			this.keys['space'] = (inputBitmask & GAMECONFIG.INPUT_BITMASK.SPACE);
			this.keys['shift'] = (inputBitmask & GAMECONFIG.INPUT_BITMASK.SHIFT);
		},

		/**
		 * Accessors
		 */
		// Some helper methods to find out if we're going in a specific direction
		isLeft: function() { return this.keys['left'];},
		isUp: function() { return this.keys['up']; },
		isRight: function() { return this.keys['right']; },
		isDown: function() { return this.keys['down']; },
		isSpace: function() { return this.keys['space']; },
		isShift: function() { return this.keys['shift']; },
		isTab: function() { return this.keys['tab']; }
	});
});