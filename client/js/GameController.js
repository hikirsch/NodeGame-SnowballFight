/**
File:
	GameController.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This class represents the client-side GameController.
	It contains a NetChannel instead of a Server, as well as a GameView 
Basic Usage: 

*/
var GameControllerClass = function(AbstractGameController, NetChannel, GameView)
{
	return AbstractGameController.extend({
		init: function(aHost, aPort) {
			console.log("Super:", this._super);
			this._super(aHost, aPort);
			this.super = this._super;
			 
			this.netChannel = new NetChannel(aHost, aPort, this);				
			this.view = new GameView();
		},
		tick: function()
		{
			this._super();
		},
		
		/**
		* These methods When netchannel recieves and validates a message
		* Anything we receive we can assume is valid
		**/
		netChannelDidConnect: function ()
		{
	//		 Good to go! Do some view setup.
			console.log("GameController.prototype.netChannelDidConnect");
		},
		
		netChannelDidReceiveMessage: function (messageEvent)
		{
			console.log('GameController.prototype.netChannelDidReceiveMessage');
		},
		
		netChannelDidDisconnect: function ()
		{
			console.log('GameController.prototype.netChannelDidDisconnect');
		},
	});
}
// RequireJS
define(['AbstractGameController', 'NetChannel', 'GameView'], GameControllerClass);
