define(['tools/Class'], function(Class)
{		
	return Class.extend({
		init: function(options) 
		{
			console.log('(AbstractGameController) Instance created');
			var that = this;
			var desiredFramerate = 55;
			
			// Things in the game
			this.players = [];		// 
			this.projectiles = [];	// Things fired
			this.entities = [];		// Everything else, e.g. trees, rocks, powerups
			
			// Loop
			this.gameClock = new Date().getTime();
			this.gameTick = setInterval(function(){that.tick()}, Math.ceil(1000/desiredFramerate));
	//		
			// Server
	//		this.server = new Snowball.Server(this, {
	//		    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
	//		    'status': false,
	//		    'recordFile': './../record[date].js',
	//		    'record': false,
	//		    'server': null
	//		});
		},
	//	
	//	ServerGameController.prototype.run = function()
	//	{
	//		this.server.run();
	//	}
		tick: function()
		{
			this.gameClock = new Date().getTime();
		
			for(var aProjectile in this.projectiles) {
				aPlayer.tick(this.gameClock);
			};
				
			for(var aPlayer in this.players) {
				//aPlayer.tick(this.gameClock);
			};
			
			for(var anEntity in this.entities) {
				anEntity.tick(this.gameClock);
			};
			
		//	 Tick the objects that are interested
		//	this.netChannel.tick(this.gameClock);
		},
		
		
		/**
		* Adding and removing players
		*/
		shouldAddNewClientWithID: function(aClientID)
		{
			console.log('Adding new client to ServerGameController with ID:' + aClientID);
			this.players[this.clientID] = new CharacterController(aClientID);
		},
		
		/**
		* These methods When netchannel recieves and validates a message
		* Anything we receive we can assume is valid
		**/
		netChannelDidConnect: function ()
		{
	//		 Good to go! Do some view setup.
			console.log("GameController.prototype.netChannelDidConnect");
		},
		
		netChannelDidReceiveMessage: function (messageEvent)
		{
			console.log('GameController.prototype.netChannelDidReceiveMessage');
		},
		
		netChannelDidDisconnect: function ()
		{
			console.log('GameController.prototype.netChannelDidDisconnect');
		}			
	});
});