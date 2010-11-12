/**
File:
	ServerGameController.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	This class is incharge of the actual game, it is aware of all the players / objects that currently exist.
	The servers version of the game, 'checks' all clients movements and internally handles collisions and informs clients
Basic Usage: 
	var gameController = new ServerGameController({
	    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
	    'status': false,
	    'recordFile': './../record[date].js',
	    'record': false,
	    'server': null
	});
	gameController.run();
	
Version:
	1.0
*/
var AbstractClassController = require('../../client/js/controllers/AbstractGame.js').Class;
var ServerNetChannel = require('../network/ServerNetChannel.js').Class;
var ArgHelper = require('../lib/ArgHelper.js');

(function(){
	exports.Class = AbstractClassController.extend({
		init: function( config, serverConfig )
		{
			this._super();

			// Server
			this.$ = new ServerNetChannel({ serverConfig: serverConfig, config: config, delegate: this });

			this.COMMAND_TO_FUNCTION = {};
		//	this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_JOINED] = this.onClientJoined;
		//	this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_DISCONNECT] = this.onRemoveClient;
			this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_MOVE] = this.onPlayerMoved;
			this.COMMAND_TO_FUNCTION[config.COMMANDS.PLAYER_FIRE] = this.genericCommand;
		},
		
		onGenericPlayerCommand: function(clientID, aDecodedMessage)
		{
			this.COMMAND_TO_FUNCTION[aDecodedMessage.cmds.cmd].apply(this,[aDecodedMessage]);
		},
		
		run: function()
		{
			this.$.run();
		},
		
		tick: function()
		{
			this._super();
		},
	});
})();