var requiredModules = [];
requiredModules.push('ClientGameController');
requiredModules.push('config');

require(requiredModules, function(ClientGameController) {	
	// Everything ready - start the game client
    require.ready(function() {
	   var gameController = new ClientGameController(HOST, PORT);
    });
});
