var init = function()
{ 
	return {
		HOST: 'localhost',
		PORT: 28785,
		DEBUG_MODE: true,
		COMMANDS: { 
			SERVER_CONNECT: 0x02,
			PLAYER_JOINED: 0x01,
			PLAYER_DISCONNECT: 0x04,
			PLAYER_MOVE: 0x08,
			PLAYER_FIRE: 0x16
		}
	}
};

if (typeof window === 'undefined') {
	exports.Config = init();
} else if( typeof define === 'function' ) {
	define( init );
}