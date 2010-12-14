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
require(['controllers/AbstractClientGame', 'config', 'scratchpad/Animal'], function(AbstractClientGame, config) {
	// Everything ready - start the game client
    require.ready(function()
	{
		var NGK = {
		};


		//
		// Tripple nested onReady function - awesome!
		var base = './';
		new CAAT.ImagePreloader().loadImages(
			[{id: 'blockOfIce4', url:base + 'img/entities/field/block-of-ice-4.png'}],
			function(counter, images) {
				console.log('yo')
				new AbstractClientGame( config );
			});
    });
});