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
	// All the different themes tha t can be applied to the views
	var THEME_MAP = {
		'0':	'default',

		'100':	'ginger-bread-house',
		'101':	'block-of-ice-1',
		'102':	'block-of-ice-2',
		'103':	'block-of-ice-3',
		'104':	'block-of-ice-4',
		'105':  'block-of-ice-5',
		'106':  'block-of-ice-6',
		'107':	'ice-mountain-with-ogilvy-flag',
		'108':	'igloo-green-flag',
		'109':	'igloo-red-flag',
		'110':	'lake-with-horizontal-bridge',
		'111':	'lake-with-vertical-bridge',
		'112':	'large-pond-1',
		'113':	'small-pond-1',
		'114':	'small-pond-2',
		'115':	'small-pond-3',

		'200':	'character-yeti',
		'201':	'character-penguin',
		'202':	'character-robot',
		'203':	'character-snowman',
		'204':	'character-tree',

		'300':	'projectile-snowball',
		'301':	'projectile-carrot',
		'302':	'projectile-bolts',
		'303':	'projectile-icicle',
		'304':	'projectile-fish',
		'305':	'projectile-ornament',
		'306':	'projectile-big-snowball',

		// for memories :-)
		'999':	'smash-tv'
	};

	var DEFAULT_MODEL = {
		theme: '0'
	};

	// Actual game play object types
	var ENTITY_MAP = {
		UNKNOWN				: 1 << 0,
		CHARACTER			: 1 << 1,
		PROJECTILE			: 1 << 2,
		FIELD_ENTITY		: 1 << 3
	};

	var COLLISION_GROUPS = {
		NONE				: 0,
		CHARACTER			: 1 << 0,
		PROJECTILE			: 1 << 1,
		FIELD_ENTITY		: 1 << 2
	};

	// For development, friendly names - WILL BE REMOVED
	var ENTITY_NAME_FRIENDLY = {
	    '1' : "UNKNOWN",
		'2' : "CHARACTER",
		'4' : "PROJECTILE",
		'8' : "FIELD_ENTITY"
	};



	// return an object containing both
	return {
		'THEME_MAP': THEME_MAP,
		'DEFAULT_MODEL': DEFAULT_MODEL,
		'ENTITY_MAP': ENTITY_MAP,
		'ENTITY_NAME_FRIENDLY': ENTITY_NAME_FRIENDLY,
		'COLLISION_GROUPS' : COLLISION_GROUPS

	}
};

if (typeof window === 'undefined') {
	EntityModel = init();
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}