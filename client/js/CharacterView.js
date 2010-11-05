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
var init = function()
{
 	return Class.extend({
		init: function(aCharacterController) 
		{
			this.controller = aCharacterController;
			
			console.log("(CharacterView)", this.controller);
			this.createElement();
			// 8 Images representing directions
			this.element.addClass( 'smash-tv' );
			
			// our default position is north
			this.currentSpriteClass = '45';
		},
		
		createElement: function() {
			this.nickName = 'nickname';
			this.element =  $('<div class="character"><p>' + this.nickName + '</p></div>');
			return this.element;
		},
		
		updatePositionAndRotation: function()
		{
			this.element.css({
				left: this.controller.position.x,
				top: this.controller.position.y
			});
			this.adjustSprite();
		},
		
		/**
		 * Based on our rotation, we should show a different sprite.
		 */
		adjustSprite: function() {
			var spriteRotation = Math.floor(this.controller.rotation / 45) * 45;
			$(this.element)
				.removeClass( 'rotation-' + this.currentSpriteClass )
				.addClass( 'rotation-' + spriteRotation );
				
			this.currentSpriteClass = spriteRotation;
		},

		destroy: function() {
			this.element.remove();
		},
	});
}

define(init);