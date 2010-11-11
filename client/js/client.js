require(['controllers/Game','config'], function(ClientGameController) {	
	// Everything ready - start the game client
    require.ready(function() {
	   var gameController = new ClientGameController(HOST, PORT);
    });
});