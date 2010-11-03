//function GameController(aHost, aPort)
//{
//	var that = this;
//	this.gameClock = new Date().getTime();
//	
//	var desiredFramerate = 55;
//	this.gameTick = setInterval(function(){that.tick()}, Math.ceil(1000/desiredFramerate));
//	this.netChannel = new NetChannel(aHost, aPort, this);
//	
//	this.view = new GameView();
//}
//
//GameController.prototype.tick = function()
//{
//	this.gameClock = new Date().getTime();
//	
	// Tick the objects that are interested
//	this.netChannel.tick(this.gameClock);
//};
//
///**
//* These methods When netchannel recieves and validates a message
//* Anything we receive we can assume is valid
//**/
//GameController.prototype.netChannelDidConnect = function ()
//{
	// Good to go! Do some view setup.
//	console.log("GameController.prototype.netChannelDidConnect");
//};
//
//GameController.prototype.netChannelDidReceiveMessage = function (messageEvent)
//{
//	console.log('GameController.prototype.netChannelDidReceiveMessage');
//};
//
//GameController.prototype.netChannelDidDisconnect = function ()
//{
//	console.log('GameController.prototype.netChannelDidDisconnect');
//};
// Browser - use RequireJS
define(['AbstractGameController', 'NetChannel', 'GameView'], function(AbstractGameController, NetChannel, GameView){

		console.log(AbstractGameController);
		console.log(NetChannel);
		console.log(GameView);
//		c
//		console.log('AbstractGameController', AbstractGameController);
//		console.log(AbstractGameController('abc)');
//	var GameController = function(aHost, aPort) {
//		console.log(AbstractGameController)
//	};
//	
//	GameController.prototype.doSomething = function() {
//		console.log('(GameController) doSomething()!');
//		return 'hi';
//	}
//	
//	return GameController;
	return AbstractGameController.extend({
		init: function(aHost, aPort) {
			this._super(aHost, aPort);
		}
	});
});


//var GameController = (function () 
//{
//		console.log('my', arguments);
//	var GameController = this.GameController = AbstractGameController( aHost, aPort)
//	{
//		console.log('b',  aHost, aPort);
//	}
//
//		var GameController = this.GameController = AbstractGameController()
//		{
//		};
//		{
//		this.super = aSuperClass;
//		console.log(aClass);
//	    var old_moduleMethod = anAbstractGameController.moduleMethod; 
//	    var super = {};  Store super method implementations here
//	    super.tick = aClass.tick;
//	    aClass.tick = function () { 
//	         method override, has access to old through old_moduleMethod... 
//	    }; 
//     
//		console.log(GameController);
//	    return GameController; 
//}(GameController));
//
//}
//
//	var AbstractGameController = require('AbstractGameController.js');
//	