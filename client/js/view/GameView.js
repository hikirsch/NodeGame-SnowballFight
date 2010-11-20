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
		},

		showJoinGame: function()
		{
			var that = this;
			HTMLFactory.joinGameDialog()
					.appendTo("body");



			$("#join").click( function(e) { that.joinGame() } );
		},
	
		serverOffline: function()
		{
			HTMLFactory.serverUnavailableDialog()
				.appendTo("body");
		},
	
		joinGame: function(e) 
		{
			var nickName = $("#nickname").val();

			console.log( "HELLO!" );
			if( nickName.length <= 0)
			{
				nickName = 'NoName' + Math.floor( Math.random() * 1000 );
			}
		
			this.gameController.joinGame(nickName);
			
			$("#join-game").remove();
			
			e.preventDefault();
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