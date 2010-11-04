var HOST = 'localhost', PORT = 28785;
var COMMANDS = {
	PLAYER_CONNECT		: 0x01,	// When a new player has connected
	SERVER_CONNECT		: 0x02, // When the server responds back on connect
	PLAYER_DISCONNECT	: 0x04,
	PLAYER_MOVE			: 0x08,
	PLAYER_FIRE			: 0x16
};

// Tell Node
if (typeof window === 'undefined') {
	console.log('commands', COMMANDS);
	exports.COMMANDS = COMMANDS;
}