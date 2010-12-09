/**
 File:
 	EntityModel.js
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
	// All the different themes that can be applied to the views
	var THEME_MAP = {
		'1': "smash-tv",
		'2': "snowballDefault",
		'3': "fieldEntityDefault"
	};

	// Actual game play object types
	var ENTITY_MAP = {
		UNKNOWN				: 1 << 0,
		CHARACTER			: 1 << 1,
		PROJECTILE			: 1 << 2,
		FIELD_ENTITY		: 1 << 3
	};

	// return an object containing both
	return {
		'THEME_MAP': THEME_MAP,
		'ENTITY_MAP': ENTITY_MAP
	}
};

if (typeof window === 'undefined') {
	EntityModel = init();
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}