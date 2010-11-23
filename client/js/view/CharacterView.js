/**
File:
	CharacterView.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	Draws the character
Basic Usage: 
 	
*/

define(['factories/HTMLFactory', 'lib/jsclass/core'], function(HTMLFactory)
{
	return new JS.Class(
	{
		initialize: function(characterController, theme ) 
		{
			this.controller = characterController;
			this.theme = theme;
			
			// our default position is north
			this.currentRotation = 0;
			
			// 8 Images representing directions
			this.createElement();
		},
		
		getElement: function() 
		{
			return this.element;
		},
		
		refresh: function()
		{
			this.destroy();
			this.createElement();
		},
		
		createElement: function( theme )
		{
			var options = {
				nickName: this.controller.getNickName(),
				theme: this.theme
			};


			this.element = HTMLFactory.character(options);

			// show the right default rotation and sprite class
			this.adjustSprite();
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
		},

		destroy: function()
		{
			this.element.remove();
		}
	});
});