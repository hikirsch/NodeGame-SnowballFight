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
            this.currentStatus = {
                TimeLeft: this.gameController.getTimeRemaining() || "00:00",
                Score: "0",
                TotalPlayers: this.gameController.getNumberOfPlayers() || "00",
                Rank: "00/00"
            };
			this.showNav();
            this.showGameStatus();
			this.showFooter();
			this.attachInstructions();
			this.inviteFriend();
			this.attachCredits();
			this.attachShare();
			this.carouselManager = CarouselManager;
			this.myCharacterModel = null;
			this.resultsOverlayShowing = false;
			this.resultsData = {};

			this.statHTML = null;

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
			this.statusElement = HTMLFactory.statusUpdates( obj )
				.appendTo("#status-updates");
			this.tmplItem = this.statusElement.tmplItem();
		},

		hideResultsView: function()
		{
			this.overlayManager.popOverlay();
			$("#results").remove();
			this.resultsOverlayShowing = false;
			this.resultsElement = null;
		},

		showResultsView: function()
		{
			this.createResultsView();
			this.overlayManager.pushOverlay( this.resultsElement );
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
			this.resultsData.NextMatchTime = ''; // this.gameController.getNextGameStartTime();
			this.resultsData.HideClass = ! this.gameController.isGameOver ? 'hide' : '';
			this.resultsData.PlayerStats = this.gameController.getResults();
			this.resultsTmplItem.update();
		},

		update: function()
		{
			if( this.statusElement === null ) {
				this.createStatusView( this.currentStatus );
			}

			// grab it on first run
			if(!this.statHTML) {
				this.statHTML = {};
				var statelement = this.statHTML.root = document.querySelector("#status-updates");
				this.statHTML.score = statelement.querySelector("dd.score");
				this.statHTML.timeLeft = statelement.querySelector("dd.time-left");
				this.statHTML.totalPlayers = statelement.querySelector("dd.total-players");
				this.statHTML.rank = statelement.querySelector("dd.rank");
			}

			// Update stats
			this.statHTML.score.innerHTML = this.gameController.clientCharacter.score;
			this.statHTML.totalPlayers.innerHTML = this.gameController.getNumberOfPlayers();
			this.statHTML.timeLeft.innerHTML = this.gameController.getTimeRemaining();
			this.statHTML.innerHTML = "0" + this.gameController.clientCharacter.rank + "/" + this.currentStatus.TotalPlayers;


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

        showGameStatus: function()
        {
          HTMLFactory.gameStatus()
            .appendTo("body");

           this.createStatusView( this.currentStatus );
        },

		showFooter: function()
		{
			HTMLFactory.footer()
				.appendTo("body");
		},

		showIntro: function()
		{
			if( location.href.toLocaleLowerCase().indexOf("playnow") > -1 ) {
				this.joinGame('200');
				return false;
			}

			if( this.cookieManager.getCookie('showIntro') != 'true' )
			{
				this.cookieManager.setCookie("showIntro", "true");

				var that = this,
					$intro = HTMLFactory.intro();

				$intro
					.find('a.jumpinLink')
					.click( function(){
						that.overlayManager.popOverlay();
						that.showCharacterSelect();

						return false;
					});

				this.overlayManager.pushOverlay( $intro );
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
//				debugger
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

				this.overlayManager.pushOverlay( $characterSelect );
			}
		},

		attachInstructions: function()
		{
			var that = this;

			$("li.instructions a").click(function() {
				that.showInstructions();
				return false;
			});
		},

		showInstructions: function()
		{
			var that = this,
				show = false,
				$instructions;

			if( ! show ) {
				show = true;
				$instructions = HTMLFactory.instructions();

				this.overlayManager.pushOverlay($instructions);

				$("#playBtn").live('click', function(e) {
					that.overlayManager.popOverlay();
					show = false;
				});
			}
		},

        showBrowserReq: function()
		{
			var $browserReq = HTMLFactory.browserRequirements();
			this.overlayManager.pushOverlay($browserReq);
			$("html").addClass('unsupported-browser');
		},

		serverOffline: function()
		{
			var $unavailableEle = HTMLFactory.serverUnavailableDialog();
			this.overlayManager.pushOverlay( $unavailableEle );
			$("html").addClass('server-offline');
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

			this.overlayManager.popOverlay();

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
			var that = this,
			    inviteOpen = 0,
			    $invite = HTMLFactory.invite();
			$("#btn-invite").live( 'click', function() {
 				if(inviteOpen === 0)
				{
					that.overlayManager.pushOverlay( $invite );
					inviteOpen = 1;
				}
				else
				{
					that.overlayManager.popOverlay();
					inviteOpen = 0;
				}
			});
		},

		attachShare: function() {
			$("li.share a").click( function() {
				return false;
			})
		},

		attachCredits: function()
		{
			var that = this;

			$("#credits-link").click( function() {
				that.showCredits();
				return false;
			});
		},

		showCredits: function()
		{
			var that = this,
				creditOpen = false,
				$credits = HTMLFactory.credits();

			if( ! creditOpen )
			{
				that.overlayManager.pushOverlay( $credits );
				creditOpen = true;
			}
			else
			{
				that.overlayManager.popOverlay();
				creditOpen = false;
			}

			$(".closeBtn").click( function() {
				that.overlayManager.popOverlay();
				creditOpen = false;
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