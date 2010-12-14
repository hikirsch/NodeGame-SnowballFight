/**
 File:
 	GameModel.js
 Created By:
	 Mario Gonzalez
 Project	:
	 Ogilvy Holiday Card 2010
 Abstract:
 	When communicating between the server and client, we need a way to discern what type an entity-type each object.
 	Map the types to integers
 Basic Usage:
 */

var init = function()
{
	return {
		width: 900,
		height: 600,
		// gameDuration: 3 * 1000
		gameDuration: 1 * 60 * 1000
	}
};

if (typeof window === 'undefined') {
	GameModel = init();
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}