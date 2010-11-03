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
//
var sys = require('sys');
var ArgHelper 	= require('./argHelper.js');
var Snowball	= require('./snowball.game.js');
require('./../client/js/CharacterController.js');

(function(){
	var ServerGameController = this.ServerGameController = function(options) {
		var that = this;
		var desiredFramerate = 55;
		
		// Things in the game
		this.players = [];		// 
		this.projectiles = [];	// Things fired
		this.entities = [];		// Everything else, e.g. trees, rocks, powerups
		
		// Loop
		this.gameClock = new Date().getTime();
		this.gameTick = setInterval(function(){that.tick()}, Math.ceil(1000/desiredFramerate));
		
		// Server
		this.server = new Snowball.Server(this, {
		    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
		    'status': false,
		    'recordFile': './../record[date].js',
		    'record': false,
		    'server': null
		});
	}
	
	ServerGameController.prototype.run = function()
	{
		this.server.run();
	}
	
	ServerGameController.prototype.tick = function()
	{
		this.gameClock = new Date().getTime();
	
		for(var aProjectile in this.projectiles) {
			aPlayer.tick(this.gameClock);
		};
			
		for(var aPlayer in this.players) {
			//aPlayer.tick(this.gameClock);
		};
		
		for(var anEntity in this.entities) {
			anEntity.tick(this.gameClock);
		};
		
	//	 Tick the objects that are interested
	//	this.netChannel.tick(this.gameClock);
	};
	
	
	/**
	* Adding and removing players
	*/
	
	ServerGameController.prototype.shouldAddNewClientWithID = function(aClientID)
	{
		console.log('Adding new client to ServerGameController with ID:' + aClientID);
		this.players[this.clientID] = new CharacterController(aClientID);
	}
	/**
	* These methods When netchannel recieves and validates a message
	* Anything we receive we can assume is valid
	**/
	ServerGameController.prototype.netChannelDidConnect = function ()
	{
//		 Good to go! Do some view setup.
		console.log("GameController.prototype.netChannelDidConnect");
	};
	
	ServerGameController.prototype.netChannelDidReceiveMessage = function (messageEvent)
	{
		console.log('GameController.prototype.netChannelDidReceiveMessage');
	};
	
	ServerGameController.prototype.netChannelDidDisconnect = function ()
	{
		console.log('GameController.prototype.netChannelDidDisconnect');
	};
		
	return ServerGameController;
})();

//exports.ServerGameController = ServerGameController;