/**
File:
	ClientGameController.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This class represents the client-side GameController.
	It contains a NetChannel instead of a Server, as well as a ClientGameView 
Basic Usage: 
	var gameController = new ClientGameController(HOST, PORT) 
*/
define([
		'lib/jsclass-core',
		'lib/Vector',
		'network/NetChannel',
		'view/GameView',
		'view/caat/MatchStartView',
		'view/caat/PowerupAnnounceView',
		'lib/Joystick',
		'controllers/AbstractGame',
		'controllers/AudioManager',
		'factories/TraitFactory',
		'controllers/FieldController',
		'lib/caat'
	],
	function( JS, Vector, NetChannel, GameView, MatchStartView, PowerupAnnounceView, Joystick, AbstractGame, AudioManager, TraitFactory, FieldController, CAAT )
	{
		console.log("arguments!", AbstractGame);
		return new JS.Class( AbstractGame,
		{
			initialize: function(config, portNumber)
			{
				this.callSuper();

				this.CMD_TO_FUNCTION = {};
				this.CMD_TO_FUNCTION[this.config.CMDS.PLAYER_JOINED] = this.onClientJoined;
				this.CMD_TO_FUNCTION[this.config.CMDS.SERVER_MATCH_START] = this.onServerMatchStart;
				this.CMD_TO_FUNCTION[this.config.CMDS.SERVER_END_GAME] = this.onShouldEndGame;

				this.clientCharacter = null; // Special pointer to our own client character
				this.isGameOver = false;

				// Create the view first, we need a place to show the browser req.
				this.view = new GameView(this, this.model );

				// You cannot play!
				if( typeof WebSocket === "undefined" ) {
					this.view.showBrowserReq( true );
					return;
				}

				// Create the director - there's only one ever. Each game is a new 'scene'
				this.director = new CAAT.Director().initialize(this.model.width, this.model.height);
				this.director.imagesCache = this.config.CAAT.imagePreloader.images;
				CAAT.GlobalDisableEvents();

				window.addEventListener(this.config.EVENTS.ON_POWERUP_AQUIRED, this.onPowerupAquired);
				this.audioManager = new AudioManager(this.config);

				this.initializeGame();
			},

			initializeGame: function()
			{
				// If set use that
				if( QueryStringManager.hasQueryString('game') ) {
					this.config.SERVER_SETTING.GAME_PORT = QueryStringManager.getQueryString('game');
				}

				this.clientCharacter = null; // Special pointer to our own client character
				this.isGameOver = false;

				this.hasPlayedFinalCountdownAudio = false;

				this.fieldController = new FieldController( this, this.model, this.config );
				this.fieldController.createView( this.model );
				this.netChannel = new NetChannel(this.config, this);
				this.initializeCaat();

				this.fieldController.onCAATInitialized(this.director);

				// Start the game timer
				this.startGameClock();
			},

			initializeCaat: function()
			{
				if(this.scene) {
					this.scene.emptyChildren();
				}

				// Init 				the scene for this match
				this.scene = new CAAT.Scene().create();
				this.director.addScene(this.scene);

				// Store
				this.config.CAAT.DIRECTOR = this.director;
				this.config.CAAT.SCENE = this.scene;

				var caatImage = new CAAT.CompoundImage().
						initialize(this.director.getImage('gameBackground'), 1, 1);

				// Create a sprite using the CompoundImage
				var background = new CAAT.SpriteActor().
						create().
						setSpriteImage(caatImage);

				this.scene.addChild(background);

				this.director.switchToNextScene( 1000, true, true);
				$(this.director.canvas).prependTo(  this.fieldController.view.getElement() );
			},

			getResults: function()
			{
				return {
					PlayerStats: this.parsePlayerStats( this.fieldController.getPlayerStats() ),
					IsGameActive: this.isGameActive(),
					ShowNextMatchTime: false
				};
			},

			createView: function()
			{
				this.view = new GameView(this);
			},

			/**
			 * Called when the user has entered a name, and wants to join the match
			 * @param aNickname
			 */
			joinGame: function(aNickname, aCharacterTheme)
			{
				this.nickname = aNickname;
				this.theme = aCharacterTheme;

				// Create the message to send to the server
				var message = this.netChannel.composeCommand( this.config.CMDS.PLAYER_JOINED, { theme: this.theme, nickname: this.nickname } );

				// Tell the server!
				this.netChannel.addMessageToQueue( true, message );
			},

			/**
			 * A connected browser client's 'main loop'
			 */
			tick: function()
			{
				this.callSuper();

				if(this.netChannel.connection === undefined) return; // waiting for next match


				this.netChannel.tick( this.gameClock );
				this.renderAtTime(this.gameClock - ( this.config.CLIENT_SETTING.interp + this.config.CLIENT_SETTING.fakelag ) );

				// Continuously store information about our input
				if( this.clientCharacter != null )
				{
					var characterStatus = this.clientCharacter.constructEntityDescription();
					var newMessage = this.netChannel.composeCommand( this.config.CMDS.PLAYER_MOVE, characterStatus );

					// create a message with our characters updated information and send it off
					this.netChannel.addMessageToQueue( false, newMessage );

					// Don't update html TOO often
					if(this.gameTick % 10 == 0)
						this.view.update();
				}


				if(!this.hasPlayedFinalCountdownAudio && this.getTimeRemaining() < 5000 && this.gameClock > 5000 ) {

					this.hasPlayedFinalCountdownAudio = true;
				 	this.config.CAAT.AUDIO_MANAGER.playSound(this.config.SOUNDS_MAP.endGameCountdown);
				}
			},

			/**
			 * Renders back in time between two previously received messages allowing for packet-loss, and a smooth simulation
			 * @param renderTime
			 */
			renderAtTime: function(renderTime)
			{
				var cmdBuffer = this.netChannel.incommingCmdBuffer,
					len = cmdBuffer.length;

				if( len < 2 ) return false; // Nothing to do!

				var newPosition = new Vector(0,0),
					newRotation = 0.0;

				// if the distance between prev and next is too great - don't interpolate
				var maxInterpolationDistance = 150,
					maxInterpolationDistanceSquared = maxInterpolationDistance*maxInterpolationDistance;

				// Store the next WED before and after the desired render time
				var nextWorldEDAfterRenderTime = null,
					previousWorldEDBeforeRenderTime = null;

				// Loop through the points, until we find the first one that has a timeValue which is greater than our renderTime
				// Knowing that then we know that the combined with the one before it - that passed our just check - we know we want to render ourselves somehwere between these two points
				var i = 0;
				while(++i < len)
				{
					var currentWorldEntityDescription = cmdBuffer[i];

					// We fall between this "currentWorldEntityDescription", and the last one we just checked
					if( currentWorldEntityDescription.gameClock >= renderTime ) {
						previousWorldEDBeforeRenderTime = cmdBuffer[i-1];
						nextWorldEDAfterRenderTime = currentWorldEntityDescription;
						break;
					}
				}

				// Could not find two points to render between
				if(nextWorldEDAfterRenderTime == null || previousWorldEDBeforeRenderTime == null) {
					return false;
				}

				/**
				 * More info: http://www.learningiphone.com/2010/09/consicely-animate-an-object-along-a-path-sensitive-to-time/
				 * Find T in the time value between the points:
				 *
				 * durationBetweenPoints: Amount of time between the timestamp in both points
				 * offset: Figure out what our time would be if we pretended the previousBeforeTime.time was 0.00 by subtracting it from us
				 * t: Now that we have a zero based offsetTime, and a maximum time that is also zero based (durationBetweenPoints)
				 * we can easily figure out what offsetTime / duration.
				 *
				 * Example values: timeValue = 5.0f, nextPointTime = 10.0f, lastPointTime = 4.0f
				 * result:
				 * duration = 6.0f
				 * offsetTime = 1.0f
				 * t = 0.16
				 */
				var durationBetweenPoints = (nextWorldEDAfterRenderTime.gameClock - previousWorldEDBeforeRenderTime.gameClock);
				var offsetTime = renderTime - previousWorldEDBeforeRenderTime.gameClock;
				var activeEntities = {};

				// T is where we fall between, as a function of these two points
				var t = offsetTime / durationBetweenPoints;
				if(t > 1.0)  t = 1.0;
				else if(t < 0) t = 0.0;

				// Note: We want to render at time "B", so grab the position at time "A" (previous), and time "C"(next)
				var entityPositionPast = new Vector(0,0),
					entityRotationPast = 0;

				var entityPositionFuture = new Vector(0,0),
					entityRotationFuture = 0;

				// Update players
				nextWorldEDAfterRenderTime.forEach(function(key, entityDesc)
				{
					// Catch garbage values
					var objectID = entityDesc.objectID;
					var entity = this.fieldController.getEntityWithObjectID( entityDesc.objectID );

					// We don't have this entity - create it!
					if( !entity )
					{
						var connectionID = entityDesc.clientID,
							isCharacter  = entityDesc.entityType == this.config.ENTITY_MODEL.ENTITY_MAP.CHARACTER,
							isOwnedByMe = connectionID == this.netChannel.clientID;

						// Take care of the special things we have to do when adding a character
						if(isCharacter)
						{
							// This character actually belongs to us
							var aCharacter = this.shouldAddPlayer( objectID, connectionID, entityDesc, this.fieldController );

							// If this character is owned by the us, allow it to be controlled by the keyboard
							if(isOwnedByMe)
							{
								var clientControlledTrait = TraitFactory.createTraitWithName('ClientControlledTrait');
								aCharacter.addTraitAndExecute( new clientControlledTrait() );
								this.config.CAAT.CLIENT_CHARACTER = this.clientCharacter = aCharacter;
							}
						}
						else // Every other kind of entity - is just a glorified view as far as the client game is concerned
						{
							 this.fieldController.createAndAddEntityFromDescription(entityDesc);
						}

						// Place it where it will be
						newPosition.set(entityDesc.x, entityDesc.y);
						newRotation = entityDesc.rotation || 0;
					}
					else // We already have this entity - update it
					{
						var previousEntityDescription = previousWorldEDBeforeRenderTime.objectForKey(objectID);

						if(!previousEntityDescription) { // Couldn't find any info for this entity, will try again next render loop
							return;
						}
						// Store past and future positions to compare
						entityPositionPast.set(previousEntityDescription.x, previousEntityDescription.y);
						entityRotationPast = previousEntityDescription.rotation;

						entityPositionFuture.set(entityDesc.x, entityDesc.y);
						entityRotationFuture = entityDesc.rotation;

						// if the distance between prev and next is too great - don't interpolate
						if(entityPositionPast.distanceSquared(entityPositionFuture) > maxInterpolationDistanceSquared) {
							t = 1;
						}

						// Interpolate the objects position by multiplying the Delta times T, and adding the previous position
						newPosition.x = ( (entityPositionFuture.x - entityPositionPast.x) * t ) + entityPositionPast.x;
						newPosition.y = ( (entityPositionFuture.y - entityPositionPast.y) * t ) + entityPositionPast.y;
						newRotation =  ( (entityRotationFuture - entityRotationPast) * t ) + entityRotationPast;
					}

					// Update the entity with the new information, and insert it into the activeEntities array
					this.fieldController.updateEntity( objectID, newPosition, newRotation, entityDesc );
					activeEntities[objectID] = true;

				}, this);


				// Destroy removed entities
				if(this.gameTick % 10 === 0)
					this.fieldController.removeExpiredEntities( activeEntities );

				this.director.render( this.clockActualTime - this.director.timeline );
				this.director.timeline = this.clockActualTime;
			},
			/**
			 * Dispatched by the server when a new player joins the match
			 * @param clientID
			 * @param data
			 */
			onClientJoined: function(clientID, data)
			{
				// Let our super class create the character
				var newCharacter = this.addClient( clientID, data.nickName, true );

				// It's us!
				if(clientID == this.netChannel.clientID)
				{
					 // Special things here
				}
			},

			onShouldEndGame: function( clientID, data )
			{
				// We have a clientCharacter - thus we're in the game
				var isInGame = this.clientCharacter != null,
					that = this;
				this.isGameOver = true;

				this.stopGameClock();

				// super delete
				this.netChannel.dealloc();
				this.netChannel = null;
				delete this.netChannel;
				this.netChannel = null;

				// this.fieldController.dealloc();
				// this.fieldController = null;

				this.clientCharacter = null;

				// Remember for next time
				this.nextGamePort = data.nextGamePort;

				if(isInGame)
				{
					this.endGameStats = {
						PlayerStats: this.parsePlayerStats( data.stats ),
						ShowNextMatchTime: true,
						NextMatchTime: this.getNextGameStartTime()
					};

					this.view.onEndGame(this.endGameStats);
					this.config.CAAT.AUDIO_MANAGER.playSound(this.config.SOUNDS_MAP.resultsScreen);

					// Start waiting for the next game

					this.gameClock = 0; // Will be used to know when to join the next game

					this.gameTickInterval = setInterval( function() { that.gameOverTick(); }, this.targetDelta );
				}
			},

			parsePlayerStats: function( data )
			{
				var allPlayersStats = [],
					allEntities = data.split('|').reverse(),
					allEntitiesLen = allEntities.length;

				// Loop through each entity
				while(--allEntitiesLen > -1) // allEntities[0] is garbage, so by using prefix we avoid it
				{
					var allStats = allEntities[allEntitiesLen],
						splitStats = allStats.split("&").reverse(),
						playerStats = {},
						splitStatsLength = splitStats.length, i;
					while(--splitStatsLength > -1)
					{
						var splitPiece = splitStats[splitStatsLength].split("="),
							name = splitPiece[0].trim(),
							value = decodeURI( splitPiece.length > 1 ? splitPiece[1].trim() : "" );

						playerStats[ name ] = value;
					}

					// Store the final result using the objectID
					allPlayersStats.push( playerStats );
				}

				// Sort on score
				allPlayersStats.sort(function(a, b)
				{
					var comparisonResult = 0;
					if((+a.score) > (+b.score)) return -1;
					else if((+a.score) < (+b.score)) return 1;
				});

				return allPlayersStats;
			},

			onServerMatchStart: function( clientID, data )
			{
				var matchViewCountdown = new MatchStartView();
			},

			onPowerupAquired: function(data)
			{
				var powerupAnnounce = new PowerupAnnounceView(arguments)
			},

			gameOverTick: function()
			{
				// Store the previous clockTime, then set it to whatever it is no, and compare time
				var oldTime = this.clockActualTime;
				var now = this.clockActualTime = new Date().getTime();
				var delta = ( now - oldTime ); // Note (var framerate = 1000/delta);

				// Our clock is zero based, so if for example it says 10,000 - that means the game started 10 seconds ago
				this.gameClock += delta;
				this.gameTick++;

				this.endGameStats.NextMatchTime = this.getNextGameStartTime();

				this.view.updateGameOver( this.endGameStats );

				// Enough time has passed, join the next game
				if( this.gameClock > this.config.GAME_MODEL.ROUND_INTERMISSION_DURATION ) {
					clearInterval( this.gameTickInterval );
					this.joinNextGame();
				}
			},

			/**
			 * Called after a match once enough time has elapsed
			 */
			joinNextGame: function()
			{
				/*
				this.view.hideResultsView();
				this.config.SERVER_SETTING.GAME_PORT = this.nextGamePort;

				this.initializeGame();

				var that = this;
				setTimeout(function(){
					that.joinGame(that.nickname, that.theme);
				}, 150);
				*/

				CookieManager.setCookie("autojoin", "true");
				CookieManager.setCookie("theme", this.theme);
				CookieManager.setCookie("nickname", this.nickname);

				location.href = "?game=" + this.nextGamePort;
			},

			/**
			 * Join match has been called from the character select screen.
			 * Because an entire game might have elapsed while they sat on this screen, make sure the game is still valid
			 */
			joinFromCharacterSelectScreen: function(aNickname, aCharacterTheme)
			{
				this.nickname = aNickname;
				this.theme = aCharacterTheme;

				// If there is no netchannel then we got dropped - lets create a new one and join the game
				if(!this.netChannel) {
					this.joinNextGame();
				} else {
					this.joinGame(aNickname, aCharacterTheme);
				}
			},

			getNextGameStartTime: function()
			{
				var t = Math.round( ( this.config.GAME_MODEL.ROUND_INTERMISSION_DURATION - this.gameClock ) / 1000);
				if( t < 0 ) t = 0;
				var m = Math.floor( t / 60 );
				var s = t % 60;
				return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
			},

			genericCommand: function()
			{
				this.log( 'genericCommand: ', arguments );
			},

			/**
			 * These methods When netchannel recieves and validates a message
			 * Anything we receive we can assume is valid
			 * This should be left more "low level" - so logic should not be added here other than mapping messages to functions
			 **/
			netChannelDidConnect: function (messageData)
			{
				// Copy the game properties from the server
				this.gameClock = messageData.gameClock;

				// we get a copy of the game model from the server to be extra efficient :-), so set it
				this.setModel( messageData.gameModel );

				if( CookieManager.getCookie("autojoin") === "true" )
				{
					var nickname = CookieManager.getCookie("nickname"),
						theme = CookieManager.getCookie("theme");

					CookieManager.setCookie( "autojoin", "false" );
					this.joinGame(nickname, theme);
				}
				else
				{
					// First connect
					if(!this.nickname)
					{
						this.view.showIntro();
					}
				}
			},

			/**
			 * Called by NetChannel when it receives a command if it decides not to intercept it.
			 * (for example CMDS.FULL_UPDATE is always intercepted, so it never calls this function, but CMDS.SERVER_MATCH_START is not intercepted so this function triggered)
			 * @param messageData
			 */
			netChannelDidReceiveMessage: function (messageData)
			{
				this.CMD_TO_FUNCTION[messageData.cmds.cmd].apply(this,[messageData.id, messageData.cmds.data]);
			},

			netChannelDidDisconnect: function (messageData)
			{
				// If the server was never online, then we never had a view to begin with
				if(!this.isGameOver)
				{
					this.view.serverOffline();
					this.stopGameClock();
				}
			},

			dealloc: function()
			{
				// Todo?
			}
		});
	}
);