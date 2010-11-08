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

var sys = require('sys');
var ArgHelper = require('./lib/ArgHelper.js');
var AbstractClassController = require('./../client/js/AbstractGameController.js').Class;
var COMMANDS = require('./../client/js/config.js').COMMANDS;

require('./ServerNetChannel.js');

(function(){
	this.ServerGameController = AbstractClassController.extend({
		init: function(aHost, aPort)
		{
			this._super(aHost, aPort);
			this.super = this._super;

			// Server
			this.server = new ServerNetChannel(this,
			{
			    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
			    'status': false,
			    'recordFile': './../record[date].js',
			    'record': false,
			    'server': null
			});
			
			this.COMMAND_TO_FUNCTION = {};
		//	this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_JOINED] = this.onClientJoined;
		//	this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_DISCONNECT] = this.onRemoveClient;
			this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_MOVE] = this.onPlayerMoved;
			this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_FIRE] = this.genericCommand;
		},
		
		onGenericPlayerCommand: function(clientID, aDecodedMessage)
		{
			this.COMMAND_TO_FUNCTION[aDecodedMessage.cmds.cmd].apply(this,[aDecodedMessage]);
		},
		
		run: function()
		{
			this.server.run();
		},
		
		tick: function()
		{
			this._super();
		},
	});
})();