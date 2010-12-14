/**
File:
	Main.js                                                          Listenin
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
	// Everything ready - start the game client
    require.ready(function()
	{
		var NGK = {
		};

		// Tripple nested onReady function - awesome!
		var base = './img/entities/caat/';
		var themes = GAMECONFIG.ENTITY_MODEL.THEME_MAP;
		var imagesToLoad = [];
		for(var aTheme in themes) {
			// ignore these
			if(themes[aTheme].match(/(stunned|default|projectile-)/g))
				continue;
			imagesToLoad.push({id: aTheme, url: base + themes[aTheme] + ".png"});
		}


		// Create CAAT accessor
		GAMECONFIG.CAAT = {};
		GAMECONFIG.CAAT.imagePreloader = new CAAT.ImagePreloader();
		// Fired when images have been preloaded
		GAMECONFIG.CAAT.imagePreloader.loadImages(imagesToLoad,
			function(counter, images) {
				if(counter != images.length) return; // Wait until last load
				var game = new AbstractClientGame( config );
			});
    });
});