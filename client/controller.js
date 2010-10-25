function Controller(game) {
	this.keys = {};
	this.keyCodes = { '37': 'left', '38': 'up', '39': 'right', '40': 'down' };
	
	this.attachEvents();
};

$.extend(Controller.prototype, {
	attachEvents: function() {
		var that = this;
	
		$('html').live({
			keydown: function( e ) {
				if( e.keyCode in that.keyCodes ) {
					that.handler( e.keyCode, true );
				};
			},
			keyup: function( e ) {
				if( e.keyCode in that.keyCodes ) {
					that.handler( e.keyCode, false );
				};
			}
		});
	},
	
	handler: function( keyCode, enabled ) {
		this.keys[ this.keyCodes[ keyCode] ] = enabled;
	},
	
	getKeys: function() {
		return this.keys;
	},
	
	isKeyPressed: function() {
		for( var keys in this.keys ) {
			if( this.keys[ keys ] ) {
				return true;
			}
		}
		return false;
	},
	
	isLeft: function() { return this.keys['left']; },
	isUp: function() { return this.keys['up']; },
	isRight: function() { return this.keys['right']; },
	isDown: function() { return this.keys['down']; }
});