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
define(['AbstractGameController', 'NetChannel', 'ClientGameView'], function(AbstractGameController, NetChannel, ClientGameView) {
	return AbstractGameController.extend
	
		/**
		 * init()
		 */
		init: function(aHost, aPort) 
		{
			this._super(aHost, aPort);

			this.netChannel = new NetChannel(aHost, aPort, this);
			this.view = new ClientGameView(this);
			this.joystick = null;
					
			this.clientCharacter = null; // Special pointer to our own client character
			this.nickName = null;
			
			this.COMMAND_TO_FUNCTION = {};
			this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_JOINED] = this.onClientJoined;
			this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_DISCONNECT] = this.onRemoveClient;
			this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_MOVE] = this.genericCommand; // Not implemented yet
			this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_FIRE] = this.genericCommand;
		},
		
		/**
		 * tick()
		 */
		tick: function()
		{
			this._super();
			this.netChannel.tick(this.gameClock);
			
			if(this.clientCharacter)
			{
				this.clientCharacter.handleInput(this.joystick);
				
				var newMessage = this.netChannel.composeCommand( COMMANDS.PLAYER_MOVE, { 
					x: this.clientCharacter.position.x, 
					y: this.clientCharacter.position.y,
					vx: this.clientCharacter.velocity.x, 
					vy: this.clientCharacter.velocity.y,
					r: this.clientCharacter.rotation
				});
				
				// create a message with our characters updated information and send it off
				this.netChannel.addMessageToQueue(false, newMessage );
			}
		},
		
		/**
		 * ClientGameView delegate
		 */
		shouldJoinGame: function(aNickName)
		{
			this.nickName = aNickName;
			
			// Tell the server!
			this.netChannel.addMessageToQueue(true, this.netChannel.composeCommand(COMMANDS.PLAYER_JOINED, null) );
		},
		
		onClientJoined: function(messageData)
		{
			// Let our super class create the character			
			var newCharacter = this.addNewClientWithID(messageData.id);
			
			// Grab the view from the character and add it to our GameView
			var newCharacterView = newCharacter.initView();
			this.view.addCharacter(newCharacterView);
			
			// It's us!
			if(messageData.id == this.netChannel.clientID)
			{
				this.joystick = new Joystick();
				this.clientCharacter = newCharacter;
			}

			return newCharacter;
		},
		
		onRemoveClient: function() 
		{
			console.log( "onRemoveClient: ", arguments );
		},
		
		genericCommand: function() {
			console.log('genericCommand: ', arguments)
		},
		
		/**
		 * These methods When netchannel recieves and validates a message
		 * Anything we receive we can assume is valid
		 * This should be left more "low level" - so logic should not be added here other than mapping messages to functions
		 **/
		netChannelDidConnect: function (messageData)
		{
//			console.log("ClientGameController.prototype.netChannelDidConnect ID:", this.netChannel.clientID, messageData);			
			// Having some problems with the CSS for now - create the player automatically, instead of waiting for
			// the view to tell us - this would be the same as if a user clicked 'Join'
			if(this.clientCharacter == null) 
			{
				this.view.joinGame();
			}
		},
		
		netChannelDidReceiveMessage: function (messageData)
		{
			// TODO: Handle array of 'cmds'
			this.COMMAND_TO_FUNCTION[messageData.cmds.cmd].apply(this,[messageData]);
		},
		
		netChannelDidDisconnect: function (messageData)
		{
			console.log('ClientGameController.prototype.netChannelDidDisconnect', messageData);
			this.view.serverOffline();
		}
	});
});
