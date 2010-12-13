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

			this.element = HTMLFactory.character( options );

			// show the right default rotation and sprite class
			this.adjustSprite();
		},

		getNickName: function()
		{
			return this.model.nickName;
		}
	});
});