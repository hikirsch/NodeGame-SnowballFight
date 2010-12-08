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

var init = function(Vector, NetChannel, GameView, Joystick, AbstractGame, ClientControlledTrait)
{

	return new JS.Class(AbstractGame,
	{
		initialize: function(config)
		{
			this.callSuper();

			this.netChannel = new NetChannel(config, this);

			this.fieldController.createView( this.model );
			this.view = new GameView(this, this.model );

			console.log( 'created NetChannel');

			this.clientCharacter = null; // Special pointer to our own client character

			this.CMD_TO_FUNCTION = {};
			this.CMD_TO_FUNCTION[config.CMDS.PLAYER_JOINED] = this.onClientJoined;
			this.CMD_TO_FUNCTION[config.CMDS.PLAYER_DISCONNECT] = this.onRemoveClient;
			this.CMD_TO_FUNCTION[config.CMDS.PLAYER_MOVE] = this.genericCommand; // Not implemented yet
			this.CMD_TO_FUNCTION[config.CMDS.PLAYER_FIRE] = this.genericCommand;
		},

		getWidth: function()
		{
			return this.fieldController.getWidth();
		},

		getHeight: function()
		{
			return this.fieldController.getHeight();
		},

		getFieldLeft: function()
		{
			return this.fieldController.getLeft();
		},

		getFieldTop: function()
		{
			return this.fieldController.getTop();
		},

		/**
		 * A connected browser client's 'main loop'
		 */
		tick: function()
		{
			this.callSuper();
			this.netChannel.tick( this.gameClock );
			this.renderAtTime(this.gameClock - ( this.config.CLIENT_SETTING.interp + this.config.CLIENT_SETTING.fakelag ) );

			// Continuously store information about our input
			if( this.clientCharacter != null )
			{
				var characterStatus = this.clientCharacter.constructEntityDescription();
				var newMessage = this.netChannel.composeCommand( this.config.CMDS.PLAYER_MOVE, characterStatus );
				
				// create a message with our characters updated information and send it off
				this.netChannel.addMessageToQueue( false, newMessage );
			}
		},

		/**
		 * Renders back in time between two previously received messages allowing for packet-loss, and a smooth simulation
		 * @param renderTime
		 */
		renderAtTime: function(renderTime)
		{
			var cmdBuffer = this.netChannel.incommingCmdBuffer;
				len = cmdBuffer.length;

			if( len < 2 ) return false; // Nothing to do!

			// if the distance between prev and next is too great - don't interpolate
			var maxInterpolationDistance = 25,
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



			var entityPositionBeforeRenderTime = new Vector(0,0);
			var entityPositionAfterRenderTime = new Vector(0,0);
			for( var objectID in nextWorldEDAfterRenderTime )
			{
				var entityDesc = nextWorldEDAfterRenderTime[objectID]; // Store the entity description

				// Catch garbage values
				if(!entityDesc.hasOwnProperty('objectID'))
					continue;

				 var entity = this.fieldController.getEntityWithObjectID( entityDesc.objectID );

				// We don't have this entity - create it!
				if( !entity )
				{
					var connectionID = entityDesc.clientID,
						isCharacter  = entityDesc.entityType == GAMECONFIG.ENTITY_MODEL.CHARACTER,
						isOwnedByMe = connectionID == this.netChannel.clientID;

					// Take care of the special things we have to do when adding a character
					if(isCharacter)
					{
						// This character actually belongs to us
						var aCharacter = this.shouldAddPlayer( objectID, connectionID, this.fieldController );

						// If this character is owned by the us, allow it to be controlled by the keyboard
						if(isOwnedByMe)
						{
							aCharacter.addTraitAndExecute(new ClientControlledTrait(aCharacter));
							this.clientCharacter = aCharacter;
						}
					}
					else // Every other kind of entity - is just a glorified view as far as the client game is concerned
					{
						 this.fieldController.createAndAddEntityFromDescription(entityDesc);
					}

					// Place it where it will be
					this.fieldController.updateEntity( objectID, {x: entityDesc.x,  y: entityDesc.y});
				}
				else // We already have this entity - update it
				{
					var prevEntityDesc = previousWorldEDBeforeRenderTime[objectID];

					// Store positions before and after to compare below
					// before
					entityPositionBeforeRenderTime.x = previousWorldEDBeforeRenderTime[ objectID ].x;
					entityPositionBeforeRenderTime.y = previousWorldEDBeforeRenderTime[ objectID ].y;
					// after
					entityPositionAfterRenderTime.x = nextWorldEDAfterRenderTime[ objectID ].x;
					entityPositionAfterRenderTime.y = nextWorldEDAfterRenderTime[ objectID ].y;

					// if the distance between prev and next is too great - don't interpolate
					if(entityPositionBeforeRenderTime.distanceSquared(entityPositionAfterRenderTime) > maxInterpolationDistanceSquared) {
						t = 1;
					}

					// Interpolate the objects position by multiplying the Delta times T, and adding the previous position
					var newCoordinates = {
						x: ( (entityPositionAfterRenderTime.x - entityPositionBeforeRenderTime.x) * t ) + entityPositionBeforeRenderTime.x,
						y: ( (entityPositionAfterRenderTime.y - entityPositionBeforeRenderTime.y) * t ) + entityPositionBeforeRenderTime.y
					};

					this.fieldController.updateEntity( objectID, newCoordinates );
				}

				// Entities not processed are considered to have been removed on the server,
				activeEntities[ objectID ] = true;
			}

			// Destroy removed entities
			this.fieldController.removeExpiredEntities( activeEntities );
		},

		createView: function()
		{
			this.view = new GameView(this);
		},

		/**
		 * ClientGameView delegate
		 */
		/**
		 * Called when the user has entered a name, and wants to join the match
		 * @param aNickName
		 */
		joinGame: function(aNickName)
		{
			// the message to send to the server
			var message = this.netChannel.composeCommand( this.config.CMDS.PLAYER_JOINED, { nickName: aNickName } );

			// Tell the server!
			this.netChannel.addMessageToQueue( true, message );
		},

		/**
		 * Dispatched by the server when a new player joins the match
		 * @param clientID
		 * @param data
		 */
		onClientJoined: function(clientID, data)
		{
			console.log( "onClientJoined~!");
			// Let our super class create the character
			var newCharacter = this.addClient( clientID, data.nickName, true );

			// It's us!
			if(clientID == this.netChannel.clientID)
			{
				 // Special things here
			}
		},

		onRemoveClient: function()
		{
			console.log( 'onRemoveClient: ', arguments );
		},

		genericCommand: function()
		{
			console.log( 'genericCommand: ', arguments );
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

			this.view.showJoinGame();
		},

		netChannelDidReceiveMessage: function (messageData)
		{
			console.log( "received message: ", messageData );
			// TODO: Handle array of 'cmds'
			// TODO: prep for cmds: send only the client ID and the message data
			this.CMD_TO_FUNCTION[messageData.cmds.cmd].apply(this,[messageData.id, messageData.cmds.data]);
		},

		netChannelDidReceiveWorldUpdate: function (messageData)
		{
//			console.log( "netChannelDidReceiveWorldUpdate", messageData );
			// TODO: Handle array of 'cmds'
			// TODO: prep for cmds: send only the client ID and the message data
//			this.CMD_TO_FUNCTION[messageData.cmds.cmd].apply(this,[messageData.id, messageData.cmds.data]);
		},

		netChannelDidDisconnect: function (messageData)
		{
			if(this.view) // If the server was never online, then we never had a view to begin with
				this.view.serverOffline();
		},

		log: function(o)
		{
			console.log(o);
		}
	});
};

define(['lib/Vector',
	'network/NetChannel', 
	'view/GameView',
	'lib/joystick',
	'controllers/AbstractGame',
	'controllers/entities/traits/ClientControlledTrait',
	'lib/jsclass/core'], init);
