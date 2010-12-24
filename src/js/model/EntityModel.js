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
	CAAT_THEME_MAP['100'] = new ThemeModel('ginger-bread-house.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['101'] = new ThemeModel('block-of-ice-1.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['102'] = new ThemeModel('block-of-ice-2.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['103'] = new ThemeModel('block-of-ice-3.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['104'] = new ThemeModel('block-of-ice-4.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['105'] = new ThemeModel('block-of-ice-5.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['106'] = new ThemeModel('block-of-ice-6.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['107'] = new ThemeModel('ice-mountain-with-ogilvy-flag.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['108'] = new ThemeModel('igloo-green-flag.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['109'] = new ThemeModel('igloo-red-flag.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['110'] = new ThemeModel('lake-with-horizontal-bridge.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['111'] = new ThemeModel('lake-with-vertical-bridge.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['112'] = new ThemeModel('large-pond-1.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['113'] = new ThemeModel('small-pond-1.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['114'] = new ThemeModel('small-pond-2.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['115'] = new ThemeModel('brown-reindeer.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['116'] = new ThemeModel('green-reindeer.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['117'] = new ThemeModel('candy-cane.png', 1, 1, 0, 0);
	CAAT_THEME_MAP['118'] = new ThemeModel('sleigh-in-ground.png', 1, 1, 0, 0);

	// Characters
	CAAT_THEME_MAP['200'] = new ThemeModel('character-yeti.png', 1, 10, 0, 2);
	CAAT_THEME_MAP['201'] = new ThemeModel('character-penguin.png', 1, 10, 0, 2);
	CAAT_THEME_MAP['202'] = new ThemeModel('character-robot.png', 1, 10, 0, 2);
	CAAT_THEME_MAP['203'] = new ThemeModel('character-snowman.png', 1, 10, 0, 2);
	CAAT_THEME_MAP['204'] = new ThemeModel('character-tree.png', 1, 10, 0, 2);
	CAAT_THEME_MAP['999'] = new ThemeModel('character-smash-tv.png', 3, 16, 2);
	// Projectiles
	CAAT_THEME_MAP['300'] = new ThemeModel('projectiles.png', 6, 1, 0, 1);
	CAAT_THEME_MAP['301'] = new ThemeModel('projectiles.png', 6, 1, 1, 1);
	CAAT_THEME_MAP['302'] = new ThemeModel('projectiles.png', 6, 1, 2, 1);
	CAAT_THEME_MAP['303'] = new ThemeModel('projectiles.png', 6, 1, 3, 1);
	CAAT_THEME_MAP['304'] = new ThemeModel('projectiles.png', 6, 1, 4, 1);
	CAAT_THEME_MAP['305'] = new ThemeModel('projectiles.png', 6, 1, 5, 1);
	// Presents
	CAAT_THEME_MAP['400'] = new ThemeModel('presents.png', 4, 1, 0, 1);
	CAAT_THEME_MAP['401'] = new ThemeModel('presents.png', 4, 1, 1, 1);
	CAAT_THEME_MAP['402'] = new ThemeModel('presents.png', 4, 1, 2, 1);
	CAAT_THEME_MAP['403'] = new ThemeModel('presents.png', 4, 1, 3, 1);
	// fanfare
	CAAT_THEME_MAP['500'] = new ThemeModel('fanfareElements.png', 8, 2, 1, 2);
	CAAT_THEME_MAP['501'] = new ThemeModel('character-hilight.png', 1, 1, 0, 1);
	CAAT_THEME_MAP['600'] = new ThemeModel('powerup-announce.png', 5, 1, 1, 2);

	var DEFAULT_MODEL = {
		theme: '0'
	};

	// Entity types, note this is not the same as collision groups.
	var ENTITY_MAP = {
		UNKNOWN				: 1 << 0,
		CHARACTER			: 1 << 1,
		PROJECTILE			: 1 << 2,
		FIELD_ENTITY		: 1 << 3
	};

	// Collision groups, note this is not the same as Entity types
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