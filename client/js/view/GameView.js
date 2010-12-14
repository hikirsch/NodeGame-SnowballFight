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
	It is allowed to HOLD data transiently (but only because it asked nicely?)
	
Basic Usage: 
	this.view = new ClientGameView(this);
	this.view.showJoinGame();
*/
define( ['lib/Rectangle', 'view/managers/OverlayManager', 'view/managers/CookieManager', 'view/managers/CarouselManager', 'view/BaseView', 'factories/HTMLFactory', 'lib/jsclass/core'], function(Rectangle, OverlayManager, CookieManager, CarouselManager, BaseView, HTMLFactory )
{
	return new JS.Class( BaseView,
	{
		initialize: function( controller, gameModel )
		{
			this.cookieManager = CookieManager;
			this.gameController = controller;
			this.overlayManager = new OverlayManager( controller, gameModel );
			this.showNav();
			this.showFooter();
			this.showInstructions();
			this.shareThis();
			this.inviteFriend();
			this.credits();
			this.carouselManager = CarouselManager;
			this.currentStatus = {
				TimeLeft: "00:00",
				Score: "0",
				TotalPlayers: "00",
				Rank: "00/00"
			};
			this.resultsData = {};
		},

		onEndGame: function()
		{
			this.createResultsView();
			this.overlayManager.show( this.resultsElement );
			this.resultsData.NextMatchTime = this.gameController.getNextGameStartTime();
			this.resultsTmplItem.update();
		},

		createStatusView: function( obj )
		{
			this.statusElement = HTMLFactory.gameStatus( obj )
				.insertAfter("nav");
			this.tmplItem = this.statusElement.tmplItem();
			this.tmplItem.data = this.currentStatus;
		},

		createResultsView: function( obj )
		{
			this.resultsElement = HTMLFactory.results( obj );
			this.resultsTmplItem = this.resultsElement.tmplItem();
			this.resultsTmplItem.data = this.resultsData;
		},

		update: function()
		{
			if( this.statusElement == null )
			{
				this.createStatusView( this.currentStatus );
			}

			this.currentStatus.Score = this.gameController.clientCharacter.score;
			this.currentStatus.Rank = this.gameController.getRank();
			this.currentStatus.TotalPlayers = this.gameController.getNumberOfPlayers();
			this.currentStatus.TimeLeft = this.gameController.getTimeRemaining();

			this.tmplItem.update();
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
			if( location.href.toLocaleLowerCase().indexOf("playnow") > -1 ) {
				this.joinGame('999');
				return false;
			}

			if( this.cookieManager.getCookie('showIntro') != 'true' )
			{
				this.cookieManager.setCookie("showIntro", "true");

				var that = this,
					$intro = HTMLFactory.intro();

				$intro
					.find('a.jumpinLink')
					.click( function(){ return that.showCharacterSelect(); } );

				this.overlayManager.show( $intro );
			}
			else
			{
				this.showCharacterSelect();
			}

			return false;
		},

		showCharacterSelect: function()
		{

			var that = this,
				$characterSelect = HTMLFactory.characterSelect();

			$characterSelect
				.find("form")
				.submit(function(e) {
					var carouselType = that.carouselManager.getCharacterType();
					var characterType = that.getThemeCodeFromName(carouselType ) ;

					return that.joinGame(characterType);
				});

			$characterSelect
				.find('img.arrowLeft')
				.click( function() {
					that.carouselManager.move(true);
				});

			$characterSelect
				.find('img.arrowRight')
				.click( function(e) {
					that.carouselManager.move(false);
				});

			this.overlayManager.show( $characterSelect );

			return false;
		},
		
		showInstructions: function() 
		{		
			var that = this;
			var show = 0;
			$instructions = HTMLFactory.instructions();
			$("li.instructions a").click( function() { 
				if(that.show != 1) {
					that.overlayManager.show($instructions); 
					that.show = 1;
					$("#playBtn").click( function() {
						if(that.gameController.clientCharacter == null) {
							that.showCharacterSelect();
						} else {
							that.overlayManager.hide();
						}
						that.show = 0;
					})
				} else {
					that.overlayManager.hide();
					that.show = 0;
				}
			});	
		},
	
		serverOffline: function()
		{
			var $unavailableEle = HTMLFactory.serverUnavailableDialog();
			this.overlayManager.show( $unavailableEle );
		},
	
		joinGame: function( characterType )
		{	
			var nickName = $("#nickname").length > 0 ? $("#nickname").val() : "";
			
			if( nickName.length <= 0)
			{
				nickName = 'NoName' + Math.floor( Math.random() * 1000 );
			}

			this.gameController.joinGame(nickName, characterType);

			this.overlayManager.hide();

			return false;
		},

			 	
		shareThis: function()	
		{
			var that = this;	
			$results = HTMLFactory.results();	
			$("li.share a").click( function() { 
				that.overlayManager.show( $results );
			});
		},
		 	
		inviteFriend: function() 
		{
			var that = this;
			var inviteOpen = 0;
			$invite = HTMLFactory.invite();
			$("#btn-invite").click( function() { 
				if(inviteOpen == 0) 
				{ 
					that.overlayManager.show( $invite );
					inviteOpen = 1;
				} 
				else
				{ 
					that.overlayManager.hide();
					inviteOpen = 0;
				}
			});	
		},

		credits: function() 	
		{
		 	
			var that = this;
		 	
			var creditOpen = 0;
		 	
			$credits = HTMLFactory.credits();
		 	
			$("#credits-link").click( function() { 
				if(creditOpen == 0)
				{
					that.overlayManager.show( $credits );
					creditOpen = 1;
				} 
				else 
				{ 
					that.overlayManager.hide();
					creditOpen = 0;
				}
			});
		},

		destroy: function()
		{
			this.element.remove();
		},

		updateGameOver: function()
		{
			this.resultsData.NextMatchTime = this.gameController.getNextGameStartTime();
			this.resultsTmplItem.update();
		}
	});
});