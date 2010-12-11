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
define( ['lib/Rectangle', 'view/managers/OverlayManager', 'view/BaseView', 'factories/HTMLFactory', 'lib/jsclass/core'], function(Rectangle, OverlayManager, BaseView, HTMLFactory )
{
	return new JS.Class( BaseView,
	{
		initialize: function( controller, gameModel )
		{
			this.gameController = controller;
			this.overlayManager = new OverlayManager( controller, gameModel );
			this.showNav();
			this.showFooter();
		},

		showNav: function()
		{
	      HTMLFactory.navigation()
			.appendTo("body");
		},

		showFooter: function()
		{
			HTMLFactory.footer()
				.appendTo("body");
		},

		showIntro: function()
		{
			this.joinGame();
			return false;
			var that = this,
				$intro = HTMLFactory.intro();

			$intro
				.find('a.jumpinLink')
				.click( function(){ return that.showJoinGame(); } );

			this.overlayManager.show( $intro );

			return false;
		},

		showJoinGame: function()
		{
			var that = this,
				$characterSelect = HTMLFactory.characterSelect();

			$characterSelect
				.find("form")
				.submit( function(e) { return that.joinGame(e); } );
			
			this.overlayManager.show( $characterSelect );

			return false;
		},
	
		serverOffline: function()
		{
			var $unavailableEle = HTMLFactory.serverUnavailableDialog();
			this.overlayManager.show( $unavailableEle );
		},
	
		joinGame: function(e)
		{	
			var nickName = $("#nickname").length > 0 ? $("#nickname").val() : "";
			
			if( nickName.length <= 0)
			{
				nickName = 'NoName' + Math.floor( Math.random() * 1000 );
			}

			this.gameController.joinGame(nickName);

			this.overlayManager.hide();
			
			return false;
		},

		destroy: function()
		{
			this.element.remove();
		}
	});
});