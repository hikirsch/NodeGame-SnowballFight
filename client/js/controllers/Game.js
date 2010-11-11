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
define(['controllers/AbstractGame', 'network/NetChannel', 'view/Game', 'lib/Joystick' ], function(AbstractGameController, NetChannel, ClientGameView) {
	return AbstractGameController.extend({
		/**
		 * init()
		 */
		init: function(aHost, aPort) 
		{
			this._super(aHost, aPort);
			
			this.view = new ClientGameView(this);
			this.netChannel = new NetChannel(aHost, aPort, this);
			
			this.joystick = null;
			this.clientCharacter = null; // Special pointer to our own client character
			
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
				this.netChannel.addMessageToQueue( false, newMessage );
			}
		},
		
		/**
		 * ClientGameView delegate
		 */
		joinGame: function(aNickName)
		{
			// the message to send to the server
			var message = this.netChannel.composeCommand( COMMANDS.PLAYER_JOINED, { nickName: aNickName } );
			
			// Tell the server!
			this.netChannel.addMessageToQueue( true, message );
		},
		
		onClientJoined: function(clientID, data)
		{
			// Let our super class create the character			
			var newCharacter = this.addNewClientWithID(clientID);
			newCharacter.setNickName( data.nickName );
			
			// Grab the view from the character and add it to our GameView
			var newCharacterView = newCharacter.initView();
			this.view.addCharacter(newCharacterView);
			
			// It's us!
			if(clientID == this.netChannel.clientID)
			{
				this.joystick = require('lib/Joystick');
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
			this.view.showJoinGame();
		},
		
		netChannelDidReceiveMessage: function (messageData)
		{
			console.log("received message: ", messageData);
			// TODO: Handle array of 'cmds'
			// TODO: prep for cmds: send only the client ID and the message data
			this.COMMAND_TO_FUNCTION[messageData.cmds.cmd].apply(this,[messageData.id, messageData.cmds.data]);
		},
		
		netChannelDidDisconnect: function (messageData)
		{
			this.view.serverOffline();
		}
	});
});
