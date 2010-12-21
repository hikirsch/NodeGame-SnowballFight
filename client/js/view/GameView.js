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

			var showStats = false; //"getContext" in document.createElement("canvas");
			if(showStats)
			{
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
					var $this = $(this);

					if( ! $(this).is('.playing') ) {
						CookieManager.setCookie("soundEnabled", "true");

						GAMECONFIG.CAAT.AUDIO_MANAGER.toggleMute(false);
					} else {
						CookieManager.setCookie("soundEnabled", "false");
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

			this.overlayManager.pushOverlay( $intro );

			return false;
		},

		showCharacterSelect: function()
		{
			var that = this,
				$characterSelect = HTMLFactory.characterSelect(),
                $characterThumbs = $characterSelect.find('#character-thumbs'),
                $thumbs = $characterThumbs.find('div');

			$characterSelect.executeOnPush = function(element){
				element.submit( function(){
					var carouselType = that.carouselManager.getCharacterType();
					var characterType = that.getThemeCodeFromName(carouselType ) ;

					return that.joinCurrentGame(characterType);
				});
			};

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
			nickName = this.filterNickname(nickName);
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

		/**
		 * If a bad word is found in any part of the name, replace completely
		 * @param textToReplace
		 */
		filterNickname: function(textToReplace)
		{
			var profanity = /(\W|_|\d|^)(ass|ass lick|asses|asshole|assholes|asskisser|asswipe|balls|bastard|beastial|beastiality|beastility|beaver|belly whacker|bestial|bestiality|bitch|bitcher|bitchers|bitches|bitchin|bitching|blow job|blowjob|blowjobs|bonehead|boner|brown eye|browneye|browntown|bucket cunt|bull shit|bullshit|bum|bung hole|butch|butt|butt breath|butt fucker|butt hair|buttface|buttfuck|buttfucker|butthead|butthole|buttpicker|chink|circle jerk|clam|clit|cobia|cock|cocks|cocksuck|cocksucked|cocksucker|cocksuc|cocksucks|cooter|crap|cum|cummer|cumming|cums|cumshot|cunilingus|cunillingus|cunnilingus|cunt|cuntlick|cuntlicker|cuntlic|cunts|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfuc|damn|dick|dike|dildo|dildos|dink|dinks|dipshit|dong|douche bag|dumbass|dyke|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|fag|fagget|fagging|faggit|faggot|faggs|fagot|fagots|fags|fart|farted|farting|fartings|farts|farty|fatass|fatso|felatio|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfuc|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfuc|fistfucs|fistfucks|fuck|fucked|fucker|fuckers|fucking|fuc|fucs|fuckme|fucks|fuk|fuks|furburger|gangbang|gangbanged|gangbangs|gaysex|gazongers|goddamn|gonads|gook|guinne|hard on|hardcoresex|homo|hooker|horniest|horny|hotsex|hussy|jack off|jackass|jac off|jackoff|jack-off|jap|jerk|jerk-off|jism|jiz|jizm|jizz|kike|kock|kondum|kondums|kraut|kum|kummer|kumming|kums|kunilingus|lesbian|lesbo|merde|mick|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked|mothafucker|mothafuckers|mothafuckin|mothafuc|mothafucs|mothafucks|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfuc|motherfucs|motherfucks|muff|nigger|niggers|orgasim|orgasims|orgasm|orgasms|pecker|penis|phonesex|phuk|phuked|phu|phukked|phuk|phuks|phuq|pimp|piss|pissed|pissrr|pissers|pisses|pissin|pissing|pissoff|prick|pricks|pussies|pussy|pussys|queer|retard|schlong|screw|sheister|shit|shited|shitfull|shiting|shitings|shits|shitted|shitter|shitters|shitting|shittings|shitty|slag|sleaze|slut|sluts|smut|snatch|spunk|twat|wetback|whore|wop)(\W|_|\d|$)/gi;
			var originalText = textToReplace;
			var afterFilter = textToReplace.replace(profanity, "" );

			if(originalText != afterFilter)
				textToReplace = '';

			return textToReplace;
		},

		attachOverlayEvents: function()
		{
			var that = this;

			$(".closeBtn").live('click', function() {
				that.overlayManager.popOverlay();
			});

			$('.intro a.jumpinLink, .intro a.jumpinLink-2').live('click', function(){
				that.overlayManager.popOverlay();
				that.showCharacterSelect();

				return false;
			});

			this.creditsOverlayOpen = false;

			$("#credits-link").live( 'click', function() {
				that.showCredits();
				return false;
			});

			$('.choose img.arrowLeft').live('click', function(e) {
				that.carouselManager.move(-1);
			});

			$('.choose img.arrowRight').live('click', function(e) {
				that.carouselManager.move(1);
			});

            $('.choose .characters div').live('click', function() {
				that.carouselManager.moveTo($thumbs.index(this));
			});

			this.devNoticeOverlayOpen = false;

			$("#dev-notice").live( 'click', function() {
				that.showDevNotice();
				return false;
			});

			$("#devNotice .closeBtn").live('click',function(){
				that.devNoticeOverlayOpen = false;
			});


			this.instructionsOverlayOpen = false;

			$("li.instructions a").live( 'click', function() {
				that.showInstructions();
				return false;
			});

			this.inviteOverlayOpen = false;

			$("#btn-invite").live( 'click', function() {
				that.showInvite();
				return false;
			});

			$('.inviteOverlay .closeBtn').live( 'click', function() {
				that.inviteOverlayOpen = false;
			});

			this.attachAddThis();
		},

		showInvite: function()
		{
			var that = this,
				$invite = HTMLFactory.invite(),
				$thankYou = HTMLFactory.inviteThankYou();

			if( ! this.inviteOverlayOpen )
			{
				$invite.executeOnPush = function(ele){
					ele.submit( function() {
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
				};

				this.overlayManager.pushOverlay( $invite );
				this.inviteOverlayOpen = true;
			}
		},

		showDevNotice: function()
		{
			var $devNotice = HTMLFactory.devNotice();

			if( ! this.devNoticeOverlayOpen )
			{
				this.overlayManager.pushOverlay( $devNotice );
				this.devNoticeOverlayOpen = true;
			}
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
			function open(ele)
			{
				var url = "http://holiday2010.ogilvy.com",
					title = "Join my #OgilvySnowballFight";

				addthis_open(ele, '', url, title);
			}

			$("li.share a")
				.attr('href', 'javascript:void(0)')
				.click(function(){
					open(this);
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