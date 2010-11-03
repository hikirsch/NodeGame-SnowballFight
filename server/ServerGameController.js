/**
File:
	ServerGameController.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	This class is incharge of the actual game, it is aware of all the players / objects that currently exist.
	The idea is to decouple this logic from the message-sending / receiving logic 
Basic Usage: 
	var ArgHelper 	= require('./argHelper.js');
	var movespeed = ArgHelper.getArgumentByNameOrSetDefault(movespeed, 3.0); // returns 3.0
	
	// ...inside some other file
	var movespeed = ArgHelper.getArgumentByNameOrSetDefault(movespeed, 1000); // returns 3.0
	
Version:
	1.0
*/

var sys = require('sys');
var ArgHelper 	= require('./argHelper.js');
var Snowball	= require('./snowball.game.js');
var AbstractClassControllerClass = require('./../client/js/AbstractGameController.js').AbstractClassController;
(function(){
	this.ServerGameController = AbstractClassControllerClass.extend({
		init: function(aHost, aPort)
		{
			this._super(aHost, aPort);
			this.super = this._super;
			
			// Server
			this.server = new Snowball.Server(this,
			{
			    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
			    'status': false,
			    'recordFile': './../record[date].js',
			    'record': false,
			    'server': null
			});
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
//})();
//
//return AbstractGameController.extend({
//	init: function(aHost, aPort) {
//		console.log("Super:", this._super);
//		this._super(aHost, aPort);
//		this.super = this._super;
//		 
//		this.netChannel = new NetChannel(aHost, aPort, this);				
//		this.view = new GameView();
//	},
//	tick: function()
//	{
//		this._super();
//	},
//	
//	/**
//	* These methods When netchannel recieves and validates a message
//	* Anything we receive we can assume is valid
//	**/
//	netChannelDidConnect: function ()
//	{
//		 Good to go! Do some view setup.
//		console.log("GameController.prototype.netChannelDidConnect");
//	},
//	
//	netChannelDidReceiveMessage: function (messageEvent)
//	{
//		console.log('GameController.prototype.netChannelDidReceiveMessage');
//	},
//	
//	netChannelDidDisconnect: function ()
//	{
//		console.log('GameController.prototype.netChannelDidDisconnect');
//	},
//});

///var sys 		= require('sys');
//var ArgHelper 	= require('./argHelper.js');
//var Snowball	= require('./snowball.game.js');
//AbstractGameController = require('./../client/js/AbstractGameController.js');
//console.log(__dirname);
//require('./../client/js/CharacterController.js');
//exports.ServerGameController = ServerGameController;