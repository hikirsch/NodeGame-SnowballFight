(function($){
	var _logger = null,
		_ticker = null,
		_character = null,
		_controller = null,
		_field = null;
	
	var Game = function() {
		function createCharacter() {
			_character = new Character(Game, _controller);
		};
		
		function createController() {
			_controller = new Controller();
		}
		
		function createField() {
			_field = $('<div class="game-container"><div class="background"></div></div>')
				.appendTo('body');
		};
		
		function tick() {
			clearLog();
			log( "Ogilvy Holiday Card 2010 - Snowball Fight" );
			// _controller.tick();
			_character.tick();
		};
		
		function setupTicker() {
			_ticker = setInterval( tick, 10 );
		};
		
		function clearLog() {
			if( _logger ) {
				_logger.html(new Date().toString()); 
			}
		}
		
		function log( msg ) {
			if( ! _logger ) { 
				_logger = $('<div id="logger"></div>').appendTo('body');
			}
			
			_logger.append( '<p>' + msg + '</p>' );
		};
		
		return {
			log: log,
			init: function() {
				createField();
				createController();
				createCharacter();
				
				setupTicker();
			},
			
			getField: function() {
				return _field;
			},
			
			destroy: function() {
				clearTimeout( _ticker );
			}
		}
	}();
	

	$( Game.init );
	// $(window).unload( Game.destroy );
	
}(jQuery)); 
