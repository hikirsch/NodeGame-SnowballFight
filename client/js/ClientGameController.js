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

*/
var ClientGameController = function(AbstractGameController, NetChannel, ClientGameView)
{
	return AbstractGameController.extend({
		init: function(aHost, aPort) {
			this._super(aHost, aPort);
			this.superClass = this._super;
			 
			this.netChannel = new NetChannel(aHost, aPort, this);				
			this.view = new ClientGameView(this);
						
			this.clientCharacter = null; // Special pointer to our own client character
			this.nickName = null;
			
			this.COMMAND_TO_FUNCTION = {};
			this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_JOINED] = this.onClientJoined;
			this.COMMAND_TO_FUNCTION[COMMANDS.PLAYER_DISCONNECT] = this.removeClient;
			this.COMMAND_TO_FUNCTION[COMMANDS.MOVE] = this.genericCommand; // Not implemented yet
			this.COMMAND_TO_FUNCTION[COMMANDS.FIRE] = this.genericCommand;
		},
		
		tick: function()
		{
			this._super();
			this.netChannel.tick(this.gameClock);
		},
		
		
		/**
		*	ClientGameView delegate
		*/
		shouldJoinGame: function(aNickName)
		{
			this.nickName = aNickName;
			
			// Tell the server!
			this.netChannel.addMessageToQueue(true, this.netChannel.composeCommand(COMMANDS.PLAYER_JOINED, null) );
		},
		
		onClientJoined: function(messageData)
		{
			console.log(messageData.id, this.netChannel.clientID);
			
			// Let our super class create the character			
			var newCharacter = this.shouldAddNewClientWithID(messageData.id);
			
			// It's us!
			if(messageData.id == this.netChannel.clientID) {
				this.clientCharacter = newCharacter;
				this.clientCharacter.initJoystick();
				console.log();
			}
			
			// Grab the view from the character and add it to our GameView
			var newCharacterView = newCharacter.initView();
			this.view.addCharacter(newCharacterView);

			return newCharacter
		},
		/**
		* These methods When netchannel recieves and validates a message
		* Anything we receive we can assume is valid
		* This should be left more "low level" - so logic should not be added here other than mapping messages to functions
		**/
		netChannelDidConnect: function (messageData)
		{
			console.log("ClientGameController.prototype.netChannelDidConnect ID:", this.netChannel.clientID, messageData);			
			// Having some problems with the CSS for now - create the player automatically, instead of waiting for
			// The view to tell us - this would be the same as if a user clicked 'Join'
			if(this.clientCharacter == null)
				this.view.joinGame();
		},
		
		netChannelDidReceiveMessage: function (messageData)
		{
			console.log('ClientGameController.prototype.netChannelDidReceiveMessage', messageData);
			
			// TODO: Handle array of 'cmds'
			this.COMMAND_TO_FUNCTION[messageData.cmds.cmd].apply(this,[messageData]);
			// Call the mapped function, always pass the data.
//			this.COMMAND_TO_FUNCTION[messageData.cmds.cmd](messageData).apply(this, [messageData]);
		},
		
		netChannelDidDisconnect: function (messageData)
		{
			console.log('ClientGameController.prototype.netChannelDidDisconnect', messageData);
			this.view.serverOffline();
		},
	});
}
// RequireJS
define(['AbstractGameController', 'NetChannel', 'ClientGameView'], ClientGameController);
