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

var init = function(NetChannel, GameView, Joystick, aConfig, AbstractGame)
{

	return new JS.Class(AbstractGame,
	{
		initialize: function(config)
		{
			this.callSuper();

			// we need to create our view first before we call our super constructor so that our
			// super class knows to create the view for anything else it needs, this is primarily
			// for the field controller since this element is being shared between client/server
			this.view = new GameView(this);
			this.fieldController.createView();

			this.netChannel = new NetChannel(config, this);

			this.clientCharacter = null; // Special pointer to our own client character

			this.CMD_TO_FUNCTION = {};
			this.CMD_TO_FUNCTION[config.CMDS.PLAYER_JOINED] = this.onClientJoined;
			this.CMD_TO_FUNCTION[config.CMDS.PLAYER_DISCONNECT] = this.onRemoveClient;
			this.CMD_TO_FUNCTION[config.CMDS.PLAYER_MOVE] = this.genericCommand; // Not implemented yet
			this.CMD_TO_FUNCTION[config.CMDS.PLAYER_FIRE] = this.genericCommand;

		},

		/**
		 * tick()
		 */
		tick: function()
		{
			this.callSuper();
			this.netChannel.tick( this.gameClock );
			this.renderAtTime(this.gameClock - ( this.config.CLIENT_SETTING.interp + this.config.CLIENT_SETTING.fakelag ) );

			// Continuously store information about this character
			if( this.clientCharacter != null )
			{
				var characterStatus = this.clientCharacter.constructEntityDescription();
				var newMessage = this.netChannel.composeCommand( this.config.CMDS.PLAYER_MOVE, characterStatus );
				
//				create a message with our characters updated information and send it off
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

			var len = cmdBuffer.length;
			if( len < 2 ) return false; // Nothing to do!

			var nextAfterTime = null;
			var previousBeforeTime = null;


			// Loop thru the points, until we find the first one that has a timeValue which is greater than our renderTime
			// Knowing that then we know that the combined with the one before it - that passed our just check - we know we want to render ourselves somehwere between these two points
			var i = 0;
			while(++i < len)
			{
				var currentWorldEntityDescription = cmdBuffer[i];

				// We fall between this "currentWorldEntityDescription", and the last one we just checked
				if( currentWorldEntityDescription.gameClock >= renderTime ) {
					previousBeforeTime = cmdBuffer[i-1];
					nextAfterTime = currentWorldEntityDescription;
					break;
				}
			}


			// Could not find two points to render between
			if(nextAfterTime == null || previousBeforeTime == null) {
				return false;
			}

			if(previousBeforeTime['1'] == undefined || nextAfterTime['1'] == undefined) return;

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
			var durationBetweenPoints = (nextAfterTime.gameClock - previousBeforeTime.gameClock);
			var offsetTime = renderTime - previousBeforeTime.gameClock;
			
			// T is where we fall between, as a function of these two points 
			var t = offsetTime / durationBetweenPoints;
			if(t > 1.0)  t = 1.0;
			else if(t < 0) t = 0.0;

			// Store positions before and after to compare below
			var prevTimeX = previousBeforeTime['1'].x;
			var prevTimeY = previousBeforeTime['1'].y;
			var nextTimeX = nextAfterTime['1'].x;
			var nextTimeY = nextAfterTime['1'].y;

			// Interpolate the objects position by multiplying the Delta times T, and adding the previous position
			this.clientCharacter.position.x = ((nextTimeX - prevTimeX) * t ) + prevTimeX;
			this.clientCharacter.position.y = ((nextTimeY - prevTimeY) * t ) + prevTimeY;
		},

		shouldAddPlayer: function (anObjectID, aClientID, playerType)
		{
			// Server ALWAYS creates 'Character' - but clients may create ClientControlledCharacter
			playerType = (aClientID == this.netChannel.clientID) ? 'ClientControlledCharacter' : 'Character'; 
			this.callSuper(anObjectID, aClientID, playerType);
		},

		/**
		 * ClientGameView delegate
		 */
		joinGame: function(aNickName)
		{
			// the message to send to the server
			var message = this.netChannel.composeCommand( this.config.CMDS.PLAYER_JOINED, { nickName: aNickName } );

			// Tell the server!
			this.netChannel.addMessageToQueue( true, message );
			// just create for now
			this.clientCharacter = this.entityFactory.createCharacter(1, 1, 'ClientControlledCharacter', this.fieldController );

			var input = new Joystick();
			input.attachEvents();
			this.clientCharacter.setInput(input);
		},

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
			this.gameClock = messageData.gameClock;
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
			this.view.serverOffline();
		},

		log: function(o)
		{
			console.log(o);
		}
	});
};

define(['network/NetChannel', 'view/GameView', 'lib/joystick', 'config',  'controllers/AbstractGame', 'lib/jsclass/core'], init);