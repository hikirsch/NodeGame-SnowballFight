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

		MASTERSERVER_PORT: 30000,
		GAME_PORT: 30000,
		MAX_PORTS: 5,
		DEBUG_MODE: true,
		MAX_PLAYERS: 8,
		SERVER_END_GAME_GRACE: 0.5,
		ROUND_INTERMISSION: 3000,
		// http://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization#Contents_of_the_User_Input_messages
		CMDS: {
			// Connection stuff // TODO: These aren't commands, but messages we should treat different
			SERVER_CONNECT: 0x01, 			// Not yet playing
			PLAYER_JOINED: 0x02,            // This is when you're in the game
			PLAYER_DISCONNECT: 0x04,

			fullupdate: 0x08,				// Request a full world-update from the server. This can happen if a the connection stuttered for a long time
			PLAYER_MOVE: 0x16,
			PLAYER_FIRE: 0x32,
			END_GAME: 0x64
		},

		CLIENT_SETTING: {
			updaterate: 1000/25, 			// How often to request an update from the server perserver
			cmdrate:	1000/30,			// How often to send accumalated CMDS to the server
			rate: 10000,					// Controls how much data we can receive / sec before we connection suffers  (2500=modem, 10000=fast-broadband)

			// Input prediction
			predict:	true,
			showerror: true,
			smooth: true,
			smoothtime: 0.1,

			// Lag compensation
			interp_ratio: 2,
			interp: 100,			   		// How far back (in milliseconds), to offset the clienttime to from the actual tick, in order to interpolate between the deltas
			extrapolate:	true,
			extrapolate_amount: 0.25,		// If the connection is suffering, and we dont get an update fast enough - extrapolate positions until after this point. Then drop.

			fakelag: 0						
		},

		SERVER_SETTING: {
			tickrate: 1000/66,				// The server runs the game at this FPS - Recommended to not modify,
			minupdaterate: 1000/10,
			maxupdaterate: 1000/60,
			minrate: 2500,
			maxrate: 10000
		},

		PRESENTS_SETTING: {
			PRESENTS_MAX: 3
		},

		// The client sends this bitmask to the server
		// See (Joystick.js)
		INPUT_BITMASK: {
			UP		: 1 << 0,
			DOWN	: 1 << 1,
			LEFT	: 1 << 2,
			RIGHT	: 1 << 3,
			SPACE	: 1 << 4,
			SHIFT	: 1 << 5,
			TAB		: 1 << 6
		},

		SCORING: {
			HIT: 10,
			MAX_MULTIPLIER: 8
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