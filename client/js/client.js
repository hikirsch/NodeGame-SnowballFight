require(['controllers/ClientGame','config'], function(ClientGameController, config) {	
	// Everything ready - start the game client
    require.ready(function() {
	   var gameController = new ClientGameController(config);
    });
});