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

var init = function(ThemeModel)
{
	var CAAT_THEME_MAP = {};
	CAAT_THEME_MAP['100'] = new ThemeModel('ginger-bread-house.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['101'] = new ThemeModel('block-of-ice-1.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['102'] = new ThemeModel('block-of-ice-2.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['103'] = new ThemeModel('block-of-ice-3.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['104'] = new ThemeModel('block-of-ice-4.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['105'] = new ThemeModel('block-of-ice-5.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['106'] = new ThemeModel('block-of-ice-6.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['107'] = new ThemeModel('ice-mountain-with-ogilvy-flag.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['108'] = new ThemeModel('igloo-green-flag.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['109'] = new ThemeModel('igloo-red-flag.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['110'] = new ThemeModel('lake-with-horizontal-bridge.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['111'] = new ThemeModel('lake-with-vertical-bridge.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['112'] = new ThemeModel('large-pond-1.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['113'] = new ThemeModel('small-pond-1.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['114'] = new ThemeModel('small-pond-2.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['115'] = new ThemeModel('small-pond-3.png', 1, 1, 0, 1);
	// Characters
	CAAT_THEME_MAP['200'] = new ThemeModel('character-yeti.png', 1, 10, 0, 0);
	CAAT_THEME_MAP['201'] = new ThemeModel('character-penguin.png', 1, 10, 0, 0);
	CAAT_THEME_MAP['202'] = new ThemeModel('character-robot.png', 1, 10, 0, 0);
	CAAT_THEME_MAP['203'] = new ThemeModel('character-snowman.png', 1, 10, 0, 0);
	CAAT_THEME_MAP['204'] = new ThemeModel('character-tree.png', 1, 10, 0, 0);
	CAAT_THEME_MAP['999'] = new ThemeModel('character-smash-tv.png', 3, 16, 1);
	// Projectiles
	CAAT_THEME_MAP['300'] = new ThemeModel('projectiles.png', 6, 1, 0, 2);
	CAAT_THEME_MAP['301'] = new ThemeModel('projectiles.png', 6, 1, 1, 2);
	CAAT_THEME_MAP['302'] = new ThemeModel('projectiles.png', 6, 1, 2, 2);
	CAAT_THEME_MAP['303'] = new ThemeModel('projectiles.png', 6, 1, 3, 2);
	CAAT_THEME_MAP['304'] = new ThemeModel('projectiles.png', 6, 1, 4, 2);
	CAAT_THEME_MAP['305'] = new ThemeModel('projectiles.png', 6, 1, 5, 2);
	CAAT_THEME_MAP['306'] = new ThemeModel('projectiles.png', 6, 1, 6, 2);

	// Presents
	CAAT_THEME_MAP['400'] = new ThemeModel('presents.png', 4, 1, 0, 3);
	CAAT_THEME_MAP['401'] = new ThemeModel('presents.png', 4, 1, 1, 3);
	CAAT_THEME_MAP['402'] = new ThemeModel('presents.png', 4, 1, 2, 3);
	CAAT_THEME_MAP['403'] = new ThemeModel('presents.png', 4, 1, 3, 3);

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

		'1200':	'character-yeti-stunned',
		'1201':	'character-penguin-stunned',
		'1202':	'character-robot-stunned',
		'1203':	'character-snowman-stunned',
		'1204':	'character-tree-stunned',

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
		'CAAT_THEME_MAP': CAAT_THEME_MAP,
		'DEFAULT_MODEL': DEFAULT_MODEL,
		'ENTITY_MAP': ENTITY_MAP,
		'ENTITY_NAME_FRIENDLY': ENTITY_NAME_FRIENDLY,
		'COLLISION_GROUPS' : COLLISION_GROUPS

	}
};

if (typeof window === 'undefined') {
	require('js/model/ThemeModel');
	EntityModel = init(ThemeModel);
} else{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['model/ThemeModel'], init);
}