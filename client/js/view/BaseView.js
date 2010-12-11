var init = function(HTMLFactory, EntityModel )
{
	return new JS.Class(
	{
		initialize:  function(controller, theme) {
			this.controller = controller;
			this.theme = theme;

			// our default position is north
			this.currentRotation = 0;
			this.createElement();
		},

		removeEntity: function( anEntityView )
		{
			anEntityView.getElement().remove();
		},

		getCssClassFromTheme: function( theme )
		{
			return EntityModel.THEME_MAP[ theme ];
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
			var actualRotation = this.controller.getRotation();
			if(actualRotation < 0) actualRotation += 360;

			// Round to the number of sprites we have
			var roundTo = 45,
				spriteOffset = 90,
				roundedRotation = Math.floor(actualRotation / roundTo) * roundTo + spriteOffset;

			if(roundedRotation > 315) // Because our sprite has a 90 degree offset, it causes the value to wrap [45-360] instead of [0-315], so until we fix the sprite we do this
				roundedRotation = 0;


			// Only modify the CSS property if it has changed
			var diff = this.currentRotation - roundedRotation;
			if(diff < -1 || diff > 1)
			{
				$(this.element)
				.removeClass( 'rotation-' + this.currentRotation )
				.addClass( 'rotation-' + roundedRotation );

				this.currentRotation = roundedRotation;
			}
		}
	});
};


define(['factories/HTMLFactory', 'model/EntityModel', 'lib/jsclass/core'], init);

