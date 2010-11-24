/**
File:
	ServerGameController.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	This class is incharge of the actual game, it is aware of all the players / objects that currently exist.
	The servers version of the game, 'checks' all clients movements and internally handles collisions and informs clients
Basic Usage: 
	var gameController = new ServerGameController({
	    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
	    'status': false,
	    'recordFile': './../record[date].js',
	    'record': false,
	    'server': null
	});
	gameController.run();
	
Version:
	1.0
*/

require('../../client/js/controllers/AbstractGame.js');
require('../../client/js/lib/Joystick.js');
require('../network/ServerNetChannel.js');
require('../model/WorldEntityDescription.js');
require('../lib/Logger.js');

ServerGame = (function()
{
	return new JS.Class(AbstractGame, {
		initialize: function(aServer)
		{
			this.callSuper();
			console.log('(ServerGame)::init');

			// Each time we create an entity we increment this
			this.nextEntityID = 1;

			// the Server has access to all the games and our logger
			// amongst other things that the entire server would need
			this.server = aServer;
			                          
			// Each ServerNetChannel is owned by a single ServerGameInstance
			this.netChannel = new ServerNetChannel(this, this.server.gameConfig);
		},

		onGenericCommand: function(clientID, aDecodedMessage)
		{
			this.CMD_TO_FUNCTION[aDecodedMessage.cmds.cmd].apply(this, [aDecodedMessage]);
		},

		onPlayerMoveCommand: function(clientID, aDecodedMessage)
		{
			/**
			 * }
(ServerNetChannel) : onMessage
{ id: 1
, seq: 415
, cmds:
   { cmd: 9
   , data:
      { objectID: 1
      , clientID: 1
      , x: 573.5
      , y: 151.44
      , vx: 0
      , vy: 0
      , r: 0
      }
   }
, t: 12659
}


			 */
			var cmdData = aDecodedMessage.cmds.data;
			var playerEntity = this.fieldController.allEntities.objectForKey(cmdData.objectID);

			playerEntity.input.keys.up = cmdData.up;
			playerEntity.input.keys.down = cmdData.down;
			playerEntity.input.keys.left = cmdData.left;
			playerEntity.input.keys.right = cmdData.right;

//			playerEntity.position.x = cmdData.x;
//			playerEntity.position.y = cmdData.y;
//			playerEntity.velocity.x = cmdData.vx;
//			playerEntity.velocity.y = cmdData.vy;
//			playerEntity.rotation = cmdData.r;

//			console.log('this.fieldController.allEntities', SYS.inspect(this.fieldController.allEntities));
//			console.log( ' a', aDecodedMessage.cmds.data.objectID);
//			console.log('player', playerEntity.velocity.x, playerEntity.velocity.y);
//			console.log('PlayerInput', SYS.inspect (playerEntity.input.isLeft() ) );//playerEntity.input.isLeft() )
//			console.log('hello', playerEntity, aDecodedMessage.cmds.data.x);
			//this.CMD_TO_FUNCTION[aDecodedMessage.cmds.cmd].apply(this, [aDecodedMessage]);
		},


		shouldAddPlayer: function (anEntityID, aClientID, playerType)
		{
			// Server ALWAYS creates 'Character' - but clients may create ClientControlledCharacter
			var aNewCharacter = this.callSuper(anEntityID, aClientID, 'Character');
			aNewCharacter.setInput(new Joystick() )

			console.log("Charinput", aNewCharacter.input);
			return aNewCharacter;
		},

		// start our game
		start: function()
		{
			this.netChannel.start();
		},

		tick: function()
		{
			this.callSuper();
			var worldEntityDescription = new WorldEntityDescription( this );
			this.netChannel.tick( this.gameClock, worldEntityDescription );
		},

		log: function(o)
		{
			// console.log( o );
			this.server.log(o);
		},

		status: function()
		{
			//this.logger.status();
		},

		/**
		 * Accessors
		 */
		getNextEntityID: function()
		{
			return this.nextEntityID++;
		}
	});
})();
