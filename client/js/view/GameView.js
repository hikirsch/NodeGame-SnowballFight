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
define( ['lib/Rectangle', 'view/managers/OverlayManager', 'view/managers/CookieManager', 'view/managers/CarouselManager', 'view/BaseView', 'factories/HTMLFactory', 'lib/Stats', 'lib/jsclass/core'], function(Rectangle, OverlayManager, CookieManager, CarouselManager, BaseView, HTMLFactory )
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
            this.showBrowserReq();
			this.inviteFriend();
			this.credits();
			this.carouselManager = CarouselManager;
			this.currentStatus = {
				TimeLeft: "00:00",
				Score: "0",
				TotalPlayers: "00",
				Rank: "00/00"
			};
			this.myCharacterModel = null;
			this.resultsOverlayShowing = false;
			this.resultsData = {};

			var showStats = true;
			if(showStats) {
				var stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.left = '0px';
				stats.domElement.style.top = '0px';
				$(stats.domElement).appendTo( $('body') );
				setInterval( function () {
					stats.update();
				}, 1000 / 30 );
			}
		},

		onEndGame: function()
		{
			this.showResultsView();
		},

		createStatusView: function( obj )
		{
			this.statusElement = HTMLFactory.gameStatus( this.currentStatus )
				.insertAfter("nav");
			this.tmplItem = this.statusElement.tmplItem();
		},

		hideResultsView: function()
		{
			this.overlayManager.hide();
			$("#results").remove();
			this.resultsOverlayShowing = false;
			this.resultsElement = null;
		},

		showResultsView: function()
		{
			this.createResultsView();
			this.overlayManager.show( this.resultsElement );
			this.updateResultsView();
			this.resultsOverlayShowing = true;
		},

		createResultsView: function()
		{
			this.resultsElement = HTMLFactory.results( this.resultsData );
			this.resultsTmplItem = this.resultsElement.tmplItem();
			this.resultsOverlayShowing = false;
		},

		updateResultsView: function()
		{
			this.resultsData.OverlayLeftStyle = this.resultsElement.css('left');
			this.resultsData.OverlayTopStyle = this.resultsElement.css('top');
			this.resultsData.NextMatchTime = 'TEST'; // this.gameController.getNextGameStartTime();
			this.resultsData.HideClass = ! this.gameController.isGameOver ? 'hide' : '';
			this.resultsData.PlayerStats = this.gameController.getResults();
			this.resultsTmplItem.update();
		},

		update: function()
		{
			if( this.statusElement == null )
			{
				this.createStatusView( this.currentStatus );
			}
			this.currentStatus.Score = this.gameController.clientCharacter.score;
			this.currentStatus.TotalPlayers = this.gameController.getNumberOfPlayers();
			this.currentStatus.TimeLeft = this.gameController.getTimeRemaining();
			this.currentStatus.Rank = "0" + this.gameController.clientCharacter.rank + "/" + this.currentStatus.TotalPlayers;

			this.tmplItem.update();

			if( this.gameController.clientCharacter.input.isTab() )
			{
				if( ! this.resultsOverlayShowing )
				{
					this.showResultsView();
				}
				else
				{
					this.updateResultsView();
				}
			}
			else
			{
				if( this.resultsOverlayShowing )
				{
					this.hideResultsView();
				}
			}
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
				this.joinGame('201');
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
			if( this.myCharacterModel != null )
			{
//				debugger;
			}
			else
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
			}

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
					});
				} else {
					that.overlayManager.hide();
					that.show = 0;
				}
			});	
		},
	
        showBrowserReq: function()
        {
            var that = this;
            var show = 0;
            $browserReq = HTMLFactory.browserRequirements();
            //TODO: replace click with conditional statement testing browser(s)ß
            $("li.share a").click( function() {
                if(that.show !== 1) {
                    that.overlayManager.show($browserReq);
                    that.show = 1;
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

			this.myCharacterModel = {
				nickName: nickName,
				characterType: characterType
			};

			this.gameController.joinGame(nickName, characterType);
			this.overlayManager.hide();

			return false;
		},

		/*
		shareThis: function()	
		{
			var that = this;	
			$results = HTMLFactory.results();
			$("li.share a").click( function() { 
				that.overlayManager.show( $results );
			});
		}, */
		 	
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