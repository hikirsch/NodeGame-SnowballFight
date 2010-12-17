var init = function(EntityModel, ProjectileModel, CharacterModel)
{ 
	return GAMECONFIG = {
		HOST: function() {
			if( typeof window === 'undefined' ) {
				return "localhost"; // game on node runs on localhost
			} else {
				return location.hostname;
			}
		}(),

		MASTERSERVER_PORT: 10000,
		GAME_PORT: 10000,
		MAX_PORTS: 5,
		DEBUG_MODE: true,
		MAX_PLAYERS: 8,
		SERVER_END_GAME_GRACE: 1500,
		ROUND_INTERMISSION: 5000,

		// See: http://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization#Contents_of_the_User_Input_messages
		CMDS:
		{
			SERVER_CONNECT	: 1 << 0, 			// Not yet playing
			PLAYER_JOINED	: 1 << 1,            // This is when you're in the game
			FULL_UPDATE		: 1 << 3,
			PLAYER_MOVE		: 1 << 4,
			PLAYER_FIRE		: 1 << 5,
			END_GAME		: 1 << 6
		},

		CLIENT_SETTING:
		{
			updaterate	: 1000/25, 			// How often to request an update from the server perserver
			cmdrate		: 1000/30,			// How often to send accumulated CMDS to the server
			rate		: 10000,			// Controls how much data we can receive / sec before we connection suffers  (2500=modem, 10000=fast-broadband)

			// Input prediction
			predict		: true,
			showerror	: true,
			smooth		: true,
			smoothtime	: 0.1,

			// Lag compensation
			interp_ratio		: 2,
			interp				: 100,		// How far back (in milliseconds), to offset the clientTime to from the actual tick, in order to interpolate between the deltas
			extrapolate			: false,
			extrapolate_amount	: 0.25,		// If the connection is suffering, and we don't get an update fast enough - extrapolate positions until after this point. Then drop.

			// Development
			fakelag				: 0
		},

		SERVER_SETTING:
		{
			tickrate: 1000/66,				// The server runs the game at this FPS - Recommended to not modify,
			minupdaterate: 1000/10,
			maxupdaterate: 1000/60,
			minrate: 2500,
			maxrate: 10000,
			NEXT_GAME_ID: 1
		},

		PRESENTS_SETTING:
		{
			PRESENTS_MAX: 15
		},

		// The client sends this bitmask to the server
		// See (Joystick.js)
		INPUT_BITMASK:
		{
			UP		: 1 << 0,
			DOWN	: 1 << 1,
			LEFT	: 1 << 2,
			RIGHT	: 1 << 3,
			SPACE	: 1 << 4,
			SHIFT	: 1 << 5,
			TAB		: 1 << 6
		},

		SCORING:
		{
			HIT: 10,
			MAX_MULTIPLIER: 8
		},

		// Allows GameEntities to communicate that they have a special trait that should be applied to them
		// For example - 'im currently frozen, i should be flashing'
		SPRITE_THEME_MASK:
		{
			FROZEN		: 1 << 0,
			FLASHING	: 1 << 1,
			HAVE_HAT	: 1 << 2,
			HAVE_POWERUP: 1 << 3
		},

		ENTITY_MODEL: EntityModel,
		PROJECTILE_MODEL: ProjectileModel,
		CHARACTER_MODEL: CharacterModel
	}
};

if (typeof window === 'undefined') {
	require('./model/EntityModel.js');
	require('./model/ProjectileModel.js');
	require('./model/CharacterModel.js');
	exports.Config = init(EntityModel, ProjectileModel, CharacterModel);
} else if( typeof define === 'function' ) {
	define(['model/EntityModel', 'model/ProjectileModel', 'model/CharacterModel'], init);
}