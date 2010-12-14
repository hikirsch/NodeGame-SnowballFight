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
define(['factories/HTMLFactory', 'view/EntityView', 'lib/jsclass/core'], function(HTMLFactory, EntityView)
{
	return new JS.Class(EntityView,
	{
		initialize: function( controller, model ) {
			this.callSuper();
			this.setModel( model );
		},

		setModel: function( model )
		{
			this.model = model;
		},

		refresh: function()
		{
			this.destroy();
			this.createElement();
		},

		createElement: function()
		{
			var options = {
				theme: this.getCssClassFromTheme( this.model.theme ),
				nickName: this.model.nickname
			};

			this.callSuper();
			this.element = HTMLFactory.character( options );
		},

		update: function()
        {
			this.callSuper();

			var actualRotation = this.controller.getRotation() + 90;
			if(actualRotation < 0) actualRotation += 359;

			// Round to the number of sprites we have
			var roundTo = 45,
				roundedRotation = Math.round(actualRotation / roundTo) * roundTo;

			// Only modify the CSS property if it has changed
			this.CAATSprite.spriteIndex =  ( roundedRotation / roundTo);
        },

		getNickName: function()
		{
			return this.model.nickName;
		}
	});
});