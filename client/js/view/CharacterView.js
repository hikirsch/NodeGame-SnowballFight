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
define(['factories/HTMLFactory', 'view/BaseView', 'lib/jsclass/core'], function(HTMLFactory, BaseView)
{
	return new JS.Class(BaseView,
	{
		refresh: function()
		{
			this.destroy();
			this.createElement();
			this.centerElement();
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
		}
	});
});