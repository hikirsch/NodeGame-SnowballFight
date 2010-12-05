var init = function(HTMLFactory)
{
	return new JS.Class(
	{
		initialize:  function(controller, theme) {
			this.controller = controller;
			this.theme = theme;
			
			this.createElement();
		},

		removeEntity: function( anEntityView )
		{
			anEntityView.getElement().remove();
		},

		getElement: function() {
			return this.element;
		},

		destroy: function() {
			this.element.destroy();
		},
		
		update: function()
		{
			// the position
			this.element.css({
				left: this.controller.getPosition().x,
				top: this.controller.getPosition().y
			});

			// the sprite
			this.adjustSprite();
		},

/**
		 * Based on our rotation, we should show a different sprite.
		 */
		adjustSprite: function()
		{
			var newRotation = this.controller.getRotationToTheNearest(45);

			$(this.element)
				.removeClass( 'rotation-' + this.currentRotation )
				.addClass( 'rotation-' + newRotation );

			this.currentRotation = newRotation;
		}
	});
};

if (typeof window === 'undefined')
{
	require('../lib/jsclass/core.js');
	BaseView = init();
} else {
	define(['factories/HTMLFactory', 'lib/jsclass/core'], init);
}

