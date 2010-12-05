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
require(['controllers/AbstractClientGame','config', 'scratchpad/Animal'], function(AbstractClientGame, config, Animal) {
	// Everything ready - start the game client
    require.ready(function()
	{
		var gameController = new AbstractClientGame(config);
    });
});