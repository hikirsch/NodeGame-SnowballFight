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
define( ['lib/Rectangle', 'view/managers/OverlayManager', 'view/managers/CookieManager', 'view/managers/CarouselManager', 'view/managers/EmailServiceManager', 'view/BaseView', 'factories/HTMLFactory', 'lib/Stats', 'lib/jsclass/core'], function(Rectangle, OverlayManager, CookieManager, CarouselManager, EmailServiceManager, BaseView, HTMLFactory )
{
	return new JS.Class( BaseView,
	{
		initialize: function( controller, gameModel )
		{
			this.setModel( gameModel );

			this.cookieManager = CookieManager;
			this.gameController = controller;

			this.overlayManager = new OverlayManager( controller, gameModel );

			this.currentStatus = {
				TimeLeft: "00:00",
				Score: "0",
				TotalPlayers: "00",
				Rank: "00/00"
			};

			this.showNav();
            this.showGameStatus();
			this.showFooter();

			this.attachOverlayEvents();

			this.carouselManager = CarouselManager;
			this.myCharacterModel = null;
			this.resultsElement = null;
			this.resultsOverlayShowing = false;
			this.resultsData = {};

			this.statHTML = null;

			var showStats = "getContext" in document.createElement("canvas");
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

		onEndGame: function(stats)
		{
			this.showResultsView(stats);
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

		showResultsView: function(stats)
		{
			if( this.resultsElement == null )
			{
				this.createResultsView();

				// we can't run update on this until it has been added to the DOM otherwise it can't measure the width of the element
				this.overlayManager.pushOverlay( this.resultsElement );
				this.resultsOverlayShowing = true;
				this.resultsElement.size = {
					width: this.resultsElement.width(),
					height: this.resultsElement.height()
				}
			}

			this.updateResultsView(stats);
		},

		createResultsView: function()
		{
			this.resultsElement = HTMLFactory.results( this.resultsData );
			this.resultsTmplItem = this.resultsElement.tmplItem();
			this.resultsOverlayShowing = false;
		},

		updateResultsView: function(stats)
		{
			this.resultsData.OverlayLeft = this.overlayManager.settings.left + ( ( this.model.width - this.resultsElement.size.width ) / 2 ),
			this.resultsData.OverlayTop = this.overlayManager.settings.top + ( ( this.model.height - this.resultsElement.size.height ) / 2 ),
			this.resultsData.NextMatchTime = stats.NextMatchTime;
			this.resultsData.ShowNextMatchTime = stats.ShowNextMatchTime ? "" : "hide";
			this.resultsData.PlayerStats = stats.PlayerStats;
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
				var statElement = this.statHTML.root = document.querySelector("#status-updates");
				this.statHTML.score = statElement.querySelector("dd.score");
				this.statHTML.timeLeft = statElement.querySelector("dd.time-left");
				this.statHTML.totalPlayers = statElement.querySelector("dd.total-players");
				this.statHTML.rank = statElement.querySelector("dd.rank");
			}

			// Update stats
			var totalPlayersString = this.addDigitPadding( this.gameController.getNumberOfPlayers() );
			this.statHTML.score.innerHTML = this.gameController.clientCharacter.score;
			this.statHTML.totalPlayers.innerHTML = totalPlayersString;
			this.statHTML.timeLeft.innerHTML =  this.formatTime( this.gameController.getTimeRemaining() );
			this.statHTML.rank.innerHTML = this.addDigitPadding( this.gameController.clientCharacter.rank ) + "/" + totalPlayersString;


			if( this.gameController.clientCharacter.input.isTab() )
			{
				var stats = this.gameController.getResults();
				if( ! this.resultsOverlayShowing )
				{
					this.showResultsView(stats);
				}
				else
				{
					this.updateResultsView(stats);
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


            var that = this,
                $soundToggle = $('#sound-toggle');

			$soundToggle.toggleClass('playing');

            $soundToggle
                .click(function(e) {
                    $this = $(this);

                    if( ! $(this).is('.playing') ) {
                        GAMECONFIG.CAAT.AUDIO_MANAGER.toggleMute(false);
                    } else {
                        GAMECONFIG.CAAT.AUDIO_MANAGER.toggleMute(true)
                    }

                    $this.toggleClass('playing');
                });
        },

		showFooter: function()
		{
			HTMLFactory.footer()
				.appendTo("body");
		},

		showIntro: function()
		{
			if( location.href.toLocaleLowerCase().indexOf("playnow") > -1 ) {
				this.joinCurrentGame('200');
				return false;
			}

			var that = this,
				$intro = HTMLFactory.intro();

			$intro
				.find('a.jumpinLink, a.jumpinLink-2')
				.click( function(){
					that.overlayManager.popOverlay();
					that.showCharacterSelect();

					return false;
				});

			this.overlayManager.pushOverlay( $intro );

			return false;
		},

		showCharacterSelect: function()
		{
			var that = this,
				$characterSelect = HTMLFactory.characterSelect(),
                $characterThumbs = $characterSelect.find('#character-thumbs'),
                $thumbs = $characterThumbs.find('div');

			$characterSelect
				.find("form")
				.submit(function(e) {
					var carouselType = that.carouselManager.getCharacterType();
					var characterType = that.getThemeCodeFromName(carouselType ) ;

					return that.joinCurrentGame(characterType);
				});

			$characterSelect
				.find('img.arrowLeft')
				.click( function() {
					that.carouselManager.move(-1);
				});

			$characterSelect
				.find('img.arrowRight')
				.click( function(e) {
					that.carouselManager.move(1);
				});

            $thumbs
                .click( function(e) {
                    that.carouselManager.moveTo($thumbs.index(this));
                });

			this.overlayManager.pushOverlay( $characterSelect );
		},

        showBrowserReq: function( dontUseField )
		{
			var $browserReq = HTMLFactory.browserRequirements(),
				$fakeField = HTMLFactory.field();

			$fakeField.insertAfter("#game-status");

			this.overlayManager.pushOverlay($browserReq, $fakeField);
			$("html").addClass('unsupported-browser');
			$("#sound-toggle").hide();
		},

		serverOffline: function()
		{
			var $unavailableEle = HTMLFactory.serverUnavailableDialog(),
				$fakeField = HTMLFactory.field(),
				$field = $(".game-container");

			if( $field.length > 0 )
			{
				$fakeField = $field;
			}
			else
			{
				$fakeField.insertAfter("#game-status");
			}


			this.overlayManager.pushOverlay( $unavailableEle, $fakeField );

			$("html").addClass('server-offline');
		},

		joinCurrentGame: function( characterType )
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

			this.gameController.joinFromCharacterSelectScreen(nickName, characterType);

			this.overlayManager.popOverlay();

			return false;
		},

		attachOverlayEvents: function()
		{
			var that = this;

			$(".closeBtn").live('click', function() {
				that.overlayManager.popOverlay();
			});

			this.attachInvite();
			this.attachCredits();
			this.attachAddThis();
			this.attachInstructions();
		},

		attachInvite: function()
		{
			var that = this;

			this.inviteOverlayOpen = false;

			$("#btn-invite").click( function() {
				that.showInvite();
				return false;
			});
		},

		showInvite: function()
		{
			var that = this,
				$invite = HTMLFactory.invite(),
				$thankYou = HTMLFactory.inviteThankYou();

			if( ! this.inviteOverlayOpen && that.gameController.isGameActive() )
			{
				that.overlayManager.pushOverlay( $invite );
				that.inviteOverlayOpen = true;

				$invite.submit( function() {
					EmailServiceManager.validateFormAndSendEmail( this, function(response) {
						if( response === "true" )
						{
							that.overlayManager.popOverlay();
							that.overlayManager.pushOverlay( $thankYou );
							that.inviteOverlayOpen = false;
						}
						else
						{
							$invite
								.find("p.error")
								.removeClass('hide')
								.html("Sorry! An error occurred while trying to send this email!");
						}
					});

					return false;
				});

				$invite.find('.closeBtn').click( function() {
					that.inviteOverlayOpen = false;
				});
			}
		},

		attachCredits: function()
		{
			var that = this;

			this.creditsOverlayOpen = false;

			$("#credits-link").click( function() {
				that.showCredits();
				return false;
			});
		},

		showCredits: function()
		{
			var that = this,
				$credits = HTMLFactory.credits();

			if( ! that.creditsOverlayOpen && this.gameController.isGameActive() )
			{
				that.overlayManager.pushOverlay( $credits );
				that.creditsOverlayOpen = true;
			}

			$credits.find(".closeBtn").click( function() {
				that.creditsOverlayOpen = false;
			});
		},

		attachAddThis: function()
		{
			function open()
			{
				var url = "http://holiday2010.ogilvy.com",
					title = "#OgilvySnowballFight";

				addthis_open(this, '', url, title);
			}

			function close()
			{
				addthis_close();
			}

			$("li.share a")
				.attr('href', 'javascript:Void()')
				.hover( open, close );
		},

		attachInstructions: function()
		{
			var that = this;

			this.instructionsOverlayOpen = false;

			$("li.instructions a").click(function() {
				that.showInstructions();
				return false;
			});
		},

		showInstructions: function()
		{
			var that = this,
				$instructions = HTMLFactory.instructions();

			if( ! this.instructionsOverlayOpen && this.gameController.isGameActive() ) {
				this.instructionsOverlayOpen = true;
				this.overlayManager.pushOverlay($instructions);
			}

			$instructions.find('.playButton').click( function(e) {
				that.instructionsOverlayOpen = false;
				that.overlayManager.popOverlay();

				return false;
			});
		},

		formatTime: function(originalTime)
		{
			if(originalTime < 0) originalTime *= -1;

			var time = "",
				sec = Math.floor( originalTime / 1000 ),
				min = Math.floor( sec / 60 ),
				seconds = this.addDigitPadding( sec % 60 ),
				minutes = this.addDigitPadding( min % 60 );

			return minutes + ":" + seconds;
		},

		addDigitPadding: function(aNumericValue)
		{
			return ( ( aNumericValue > 9 ) ? "" : "0") + aNumericValue;
		},

		destroy: function()
		{
			this.element.remove();
		},

		updateGameOver: function(stats)
		{
			this.updateResultsView(stats);
		}
	});
});