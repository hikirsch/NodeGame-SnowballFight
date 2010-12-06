/**
File:
	GameView.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This is class represents the View in the MVC architecture for the game.
	It must not OWN any data, not even a little :) 
	It is allowed to HOLD data transiently 
	
Basic Usage: 
	this.view = new ClientGameView(this);
	this.view.showJoinGame();
*/
define( ['lib/Rectangle', 'factories/HTMLFactory', 'view/FieldView', 'lib/jsclass/core'], function(Rectangle, HTMLFactory, FieldView)
{
	return new JS.Class(
	{
		initialize: function(controller)
		{                                  
			this.gameController = controller;

			this.showNav();
		},

		showNav: function()
		{
	      HTMLFactory.navigation()
			.appendTo("body");
		},

		showJoinGame: function()
		{
			var that = this;
			var joinGameDialog = HTMLFactory.joinGameDialog();
			joinGameDialog.appendTo("body");
			$(joinGameDialog).click( function(e){ that.joinGame(e); });  // Had bug with bind, feel free to remove this and re-add bind
		},
	
		serverOffline: function()
		{
			HTMLFactory.serverUnavailableDialog()
				.appendTo("body");
		},
	
		joinGame: function(e)
		{
			e.preventDefault();
			var nickName = $("#nickname").val();
			
			if( nickName.length <= 0)
			{
				nickName = 'NoName' + Math.floor( Math.random() * 1000 );
			}

			this.gameController.joinGame(nickName);
			$("#join-game").remove();

		},
	
		addCharacter: function(aCharacterView)
		{
			aCharacterView.element.appendTo(this.field.getElement());
		},
	
		getFieldRect: function()
		{
			return new Rectangle(0, 0, this.field.width(), this.field.height());
		},
	
		destroy: function() {
			this.element.remove();
		}
	});
});