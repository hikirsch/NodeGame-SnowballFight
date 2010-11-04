/**
File:
	ClientGameController.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This class represents the client-side GameController.
	It contains a NetChannel instead of a Server, as well as a GameView 
Basic Usage: 

*/
var ClientGameController = function(AbstractGameController, NetChannel, GameView)
{
		console.log(AbstractGameController);
	
	return AbstractGameController.extend({
		init: function(aHost, aPort) {
			console.log("Super:", this._super);
			this._super(aHost, aPort);
			this.super = this._super;
			 
			this.netChannel = new NetChannel(aHost, aPort, this);				
			this.view = new GameView();
			
			this.clientCharacter = null; // Special pointer to our own client character
		},
		tick: function()
		{
			this._super();
			this.netChannel.tick(this.gameClock);
		},
		
		/**
		* These methods When netchannel recieves and validates a message
		* Anything we receive we can assume is valid
		**/
		netChannelDidConnect: function (messageEvent)
		{
	//		 Good to go! Do some view setup.
			this.shouldAddNewClientWithID(this.netChannel.clientID);
			console.log("ClientGameController.prototype.netChannelDidConnect");
		},
		
		netChannelDidReceiveMessage: function (messageEvent)
		{
			console.log('ClientGameController.prototype.netChannelDidReceiveMessage');
		},
		
		netChannelDidDisconnect: function (messageEvent)
		{
			console.log('ClientGameController.prototype.netChannelDidDisconnect');
		},
	});
}
// RequireJS
define(['AbstractGameController', 'NetChannel', 'GameView'], ClientGameController);
