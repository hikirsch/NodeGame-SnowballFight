/**
File:
	Main.js
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This is the point of entry on the client side.
Basic Usage:
*/

define(['controllers/AbstractClientGame', 'config', 'lib/caat'], function (AbstractClientGame, config, CAAT) {
	// thanks IE for not having trim(), i appreciate that.
	if(typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}

	/**
	 * We have share functionality that is used by addthis.
	 */
	function addthis()
	{
		var at = document.createElement('script'),
			s = document.getElementsByTagName('script')[0];

		window.addthis_options = 'facebook, twitter, myspace, print, google, favorites, digg, delicious, stumble upon, live, email, more';
		window.addthis_config = { username: 'oglivycom', ui_offset_top: 0, ui_offset_left: 0 };

		at.async = true;
		at.src = 'http://s7.addthis.com/js/250/addthis_widget.js';

		s.parentNode.insertBefore(at, s);
	}

	/**
	 * We are tracking via Google Analytics.
	 */
	function googleAnalytics()
	{
		window._gaq = [],
			ga = document.createElement('script'),
			s = document.getElementsByTagName('script')[0];

		_gaq.push(['_setAccount', 'UA-18583864-6']);
		_gaq.push(['_trackPageview']);

		ga.async = true;
		ga.src = 'http://www.google-analytics.com/ga.js';

		s.parentNode.insertBefore(ga, s);
	}

	/**
	 * Since a lot of browsers don't have a console, we swallow any of the log statements if it can't actually show it.
	 */
	function ignoreConsoleIfUndefined()
	{
		var Void = function(){};
		if(!("console" in window)){
			window.console={};
		}
		$.each(["groupCollapsed","groupEnd","group","warn","info","dir","warn","error","log"], function(i,s) {
			if (!( s in console ) ) { window.console[s] = Void; }
		});
	}

	function preloadImages( callback )
	{
		// Tripple nested onReady function - awesome!
		var base = './img/entities/';
		var themes = config.ENTITY_MODEL.CAAT_THEME_MAP;
		var imagesToLoad = [];
		for(var aTheme in themes) {
			imagesToLoad.push( {id: aTheme, url: base + themes[aTheme].imageSource } );
		}

		// Countdown notifications
		imagesToLoad.push({id: "notification_getready", url: base + "matchstart/notification_getready.png"});
		imagesToLoad.push({id: "notification_3", url: base + "matchstart/notification_3.png"});
		imagesToLoad.push({id: "notification_2", url: base + "matchstart/notification_2.png"});
		imagesToLoad.push({id: "notification_1", url: base + "matchstart/notification_1.png"});
		imagesToLoad.push({id: "notification_go", url: base + "matchstart/notification_go.png"});

		// BG Image
		imagesToLoad.push({id: "gameBackground", url: base + "bg-field.png"});

		// Create CAAT accessor
		config.CAAT = {};
		config.CAAT.imagePreloader = new CAAT.ImagePreloader();
		// Fired when images have been preloaded
		config.CAAT.imagePreloader.loadImages(imagesToLoad, function(counter, images) {
			if(counter != images.length) return; // Wait until last load
		 	callback();
		});
	}

	function startGame()
	{
		new AbstractClientGame( config, config.SERVER_SETTING.GAME_PORT );
	}

	// Everything ready - start the game client
    require.ready(function()
	{
		// This is Google Chrome frame, if IE comes through, this will activate automatically.
		CFInstall.check({
			mode: "overlay",
			destination: location.href.toString()
		});

		addthis();
		googleAnalytics();
		ignoreConsoleIfUndefined();

		// preload game images, once preloaded, we want to start the game
		preloadImages( startGame );
    });
});