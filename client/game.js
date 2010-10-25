(function($){
	var 
		// this is the default clock, how often do we refresh, set into setInterval()
		_gameSpeed = 10,
		
		// a logger is helpful
		_logger = null,
	
		// this is our timer, how fast our game is going to go
		_ticker = null,
		
		// our main character, the player i'm playing as
		_character = null,
		
		// the controller allows me to detect events and do stuff when the player presses keys or whatever it is they do
		_controller = null,
		
		// our playing field, where the action takes place
		_field = null,
	
		// our game
		Game = function() {
			function init() {
				createField();
				createController();
				createCharacter();
			
				setupTicker();
			};
			
			/**
			 * The user is done playing the game, we have to do somethings first.
			 */
			function destroy() { 
				clearTimeout( _ticker );
			}
			
			/** 
			 * We need to represent our main character into the game.
			 */
			function createCharacter() {
				_character = new Character(Game, _controller);
			};
		
			/**
			 * Our controller helps us figure out which keys are currently being pressed.
			 */
			function createController() {
				_controller = new Controller();
			}
		
			/**
			 * Our players and game artifacts get placed into a field. The action is started right here.
			 */
			function createField() {
				_field = $('<div class="game-container"><div class="background"></div></div>')
					.appendTo('body');
			};
		
			/**
			 * Tick tock, the clock is running! Make everyone do stuff.
			 */
			function tick() {
				clearLog();
				log( "Ogilvy Holiday Card 2010 - Snowball Fight" );
				_character.tick();
			};
		
			/**
			 * Our main clock, this is essentially how fast the game goes.
			 */
			function setupTicker() {
				_ticker = setInterval( tick, _gameSpeed );
			};
			
			/**
			 * Clear the log, and append a new date stamp.
			 */
			function clearLog() {
				if( _logger ) {
					_logger.html(new Date().toString()); 
				}
			};
		
			// TODO: We come with a built in logger, how poorly designed. This should be pulled out into its own class
			function log( msg ) {
				if( ! _logger ) { 
					_logger = $('<div id="logger"></div>').appendTo('body');
				}
			
				_logger.append( '<p>' + msg + '</p>' );
			};
		
			// our public accesors
			return {
				init: init,
				destroy: destroy,
				log: log, // TODO: get rid of this
				getField: function() { return _field; }
			};
		}();
	
	$( Game.init );
	$(window).unload( Game.destroy );
	
}(jQuery)); 
