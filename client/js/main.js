/**
File:
	Main.js
Created By:
	Adam Kirschner
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This is the main class of the game on the client side.
Basic Usage:
 	See index.html // TODO: Update basic usage.
*/
require(['controllers/AbstractClientGame', 'config', 'lib/caat'], function(AbstractClientGame, config) {
	/**
	 * we do a lot of logging, some browsers don't have a console, so i create this fake one so it swallows any calls
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

	// thanks IE for not having trim(), i appreciate that.
	if(typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}

	// Everything ready - start the game client
    require.ready(function()
	{
		CFInstall.check({
			mode: "overlay",
			destination: location.href.toString()
		});

		ignoreConsoleIfUndefined();

		var NGK = {};

		// Tripple nested onReady function - awesome!
		var base = './img/entities/';
		var themes = GAMECONFIG.ENTITY_MODEL.CAAT_THEME_MAP;
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


		// Disable CAAT from capturing events

		// Create CAAT accessor
		GAMECONFIG.CAAT = {};
		GAMECONFIG.CAAT.imagePreloader = new CAAT.ImagePreloader();
		// Fired when images have been preloaded
		GAMECONFIG.CAAT.imagePreloader.loadImages(imagesToLoad,
			function(counter, images) {
				if(counter != images.length) return; // Wait until last load
				var game = window.clientGame = new AbstractClientGame( config );
			});
    });
});


