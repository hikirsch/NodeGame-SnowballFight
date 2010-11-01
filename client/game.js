(function($){
	var
		// our messages we can send to the server
	 	MESSAGES = {
			INIT: 1,
			CHARACTER_UPDATE: 2,
			SET_NICKNAME: 3,
			ADD_FOREIGN_CHARACTER: 4,
			REMOVE_FOREIGN_CHARACTER: 5
		},
	
		// our connection
		_conn = null,
	
		// this is the default clock, how often do we refresh, set into setInterval()
		_gameSpeed = 1000 / 100,
		
		// a logger is helpful
		_logger = null,
	
		// this is our timer, how fast our game is going to go
		_ticker = null,
		
		// our main character, the player i'm playing as
		_character = null,
		
		// our other players
		_foreignCharacters = [],
		
		// the controller allows me to detect events and do stuff when the player presses keys or whatever it is they do
		_controller = null,
		
		// our playing field, where the action takes place
		_field = null,
		
		// whether or not i am connected to a server
		_online = false,
		
		// our game
		Game = function() {
			function init(host, port) {
				
				var that = this;
				_conn = new WebSocket('ws://' + host + ':' + port);
				console.log(host, port, _conn);
				_conn.onopen = function() {
					_online = true;
					$("#join-game").show();
					sendMessage([MESSAGES.INIT, {}]);
				};

				_conn.onclose = function() {
					if (!_online) {
						serverOffline();
					}
				};
				
				_conn.onmessage = function(e) {
					console.log(e);
					var decodedMessage = BISON.decode( e.data );
					handleMessage( decodedMessage[0], decodedMessage[1] );
				};
				
				$("#join").click( joinGame );
			};
			
			function handleMessage( msg, data ) {
				switch( msg ) {
					case MESSAGES.INIT: 
						startGame( data );
						break;
					case MESSAGES.ADD_FOREIGN_CHARACTER:
						addForeignCharacter( data.clientID, data );
						break;
					case MESSAGES.REMOVE_FOREIGN_CHARACTER:
						removeForeignCharacter( data );
						break;
					case MESSAGES.CHARACTER_UPDATE:
						_foreignCharacters[ data.clientID ].update( data );
						break;
					default:
						console.log('fail', msg );
						break;
				}
			}
			
			function removeForeignCharacter( data ) {
				_foreignCharacters[ data.clientID ].destroy();
				delete _foreignCharacters[ data.clientID ];
			}
			
			function addForeignCharacter( clientID, character ) {
				var newCharacter = new Character( Game, null, character.nickname );
				newCharacter.update( character );
				_foreignCharacters[ clientID ] = newCharacter;
			}
			
			function serverOffline() { 
				$("#no-server").show();
			}
			
			function sendMessage( msg ) {
				var encodedMsg = BISON.encode( msg );
				_conn.send( encodedMsg );
			}
			
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
				_character = new Character(Game, _controller, _nickname);
				_character.updateGame();
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
				log( "Connection Live? " + _online );
				if( _character ) {
					_character.tick();
				}
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
		
			function startGame( data ) {
				createField();
				setupTicker();
				
				if( "characters" in data ) {
					for( var clientID in data.characters ) {
						addForeignCharacter( clientID, data.characters[clientID] );
					}
				}
			};
			
			function joinGame() {
				_nickname = $("#nickname").val();
				if( _nickname.length > 0 ){
					$("#join-game").remove();
					createController();
					createCharacter();
					sendMessage([MESSAGES.SET_NICKNAME, {
						nickname : _nickname,
						x: _character.x,
						y: _character.y,
						rotation: _character.rotation
					}]);

				} else {
					alert("Please enter a nickname!");
				}
				
				return false;
			}
		
			// TODO: We come with a built in logger, how poorly designed. This should be pulled out into its own class
			function log( msg ) {
				if( ! _logger ) { 
					_logger = $('<div id="logger"></div>').appendTo('body');
				}
			
				_logger.append( '<p>' + msg + '</p>' );
			};
			
			function characterUpdate( character ) {
				sendMessage([MESSAGES.CHARACTER_UPDATE, { x: character.x, y: character.y, rotation: character.rotation } ] ); 
			}
		
			// our public accesors
			return {
				init: function() {
					init( HOST, PORT );
				},
				characterUpdate: characterUpdate,
				destroy: destroy,
				log: log, // TODO: get rid of this
				getField: function() { return _field; },
				getNickName: function() { return _nickname; }
			};
		}();
	
	$( Game.init );
	$(window).unload( Game.destroy );
	
}(jQuery)); 
