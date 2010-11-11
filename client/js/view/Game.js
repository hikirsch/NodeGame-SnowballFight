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
	this.view = new ClientGameView(this);
	this.view.showJoinGame();
*/
define( [ 'lib/Rectangle', 'factories/Html' ], function( Rectangle, htmlFactory ) { 
	return Class.extend({
		init: function(aDelegate) 
		{
			this.delegate = aDelegate;
			this.createField();
		},
	
		/**
		 * Our players and game artifacts get placed into a field. The action is started right here.
		 */
		createField: function()
		{
			this.field = $('<div class="game-container"><div class="background"></div></div>')
							.appendTo('body');
		},
	
		showJoinGame: function()
		{
			var that = this;
			htmlFactory.joinGameDialog()
				.appendTo("body")
			
			$("#join").click(function(e) { that.joinGame(e); });
		},
	
		serverOffline: function()
		{
			htmlFactory.serverUnavailableDialog()
				.appendTo("body");
		},
	
		joinGame: function(e) 
		{
			var nickName = $("#nickname").val();
		
			if( nickName.length <= 0)
			{
				nickName = 'NoName';
			}
		
			this.delegate.joinGame(nickName);
			
			$("#join-game").remove();
			
			e.preventDefault();
		},
	
		addCharacter: function(aCharacterView)
		{
			aCharacterView.element.appendTo(this.field);
		},
	
		getFieldRect: function()
		{
			return new Rectangle(0, 0, this.field.width(), this.field.height());
		},
	
		destroy: function() {
			this.element.remove();
		}
	});
});