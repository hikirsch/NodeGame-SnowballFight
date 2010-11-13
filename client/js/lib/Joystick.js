/**
 * A helper class to detect the current state of the controls of the game. 
 */
define( ['jquery'] ,function($) {
	var keyCodes = { '32': 'space', '37': 'left', '38': 'up', '39': 'right', '40': 'down'},
		keys = {},
		keyPressed = 0;
	
	/**
	 * We don't care about a time clock here, we attach events, we only want
	 * to know if something's happened.
	 */
	function attachEvents() {
		$('html').live({
			keydown: function( e ) {
				if( e.keyCode in keyCodes ) {
					// if we're already pressing down on the same key, then we don't want to increment
					// our key pressed count
					if( ! keys[ keyCodes[ e.keyCode ] ] ) { 
						keyPressed++;
					}
					handler( e.keyCode, true );
				}
			},
		
			keyup: function( e ) {
				if( e.keyCode in keyCodes ) {
					handler( e.keyCode, false );
					keyPressed--;
				};
			
			}
		});
	}

	/** 
	 * Map it to something useful so we know what it is
	 */
	function handler( keyCode, enabled ) {
		keys[ keyCodes[ keyCode] ] = enabled;
	};
	
	// attach the events on ready
	require.ready( attachEvents );
	
	return {		
		/**
		 * Just figure out whether or not I have any keys currently pressed.
		 */
		isKeyPressed: function() {
			return keyPressed > 0;
		},

		/**
		 * Some helper methods to find out if we're going in a specific direction
		 */
		isLeft: function() { return keys['left']; },
		isUp: function() { return keys['up']; },
		isRight: function() { return keys['right']; },
		isDown: function() { return keys['down']; },
		isSpace: function() { return keys['space']; }
	};
});