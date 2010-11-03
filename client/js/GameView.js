/**
File:
	GameView.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This is class represents the View in the MVC architecture for the game.
	It must not OWN any data, not even a little :) 
	It is allowed to HOLD data transiently 
	
Basic Usage: 

*/
define(function(){

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
		var GameView =  function() {
		};
		
		GameView.prototype.doSomething = function() {
			console.log('(GameView) doSomething()!');
			return 'hi';
		}
		
		return GameView;
});