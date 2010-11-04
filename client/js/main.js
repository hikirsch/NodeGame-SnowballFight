var requiredModules = [];
requiredModules.push('lib/Class');
requiredModules.push('ClientGameController');
requiredModules.push('./config.js');

require(requiredModules, function(Class, ClientGameController) 
{
	// Everything ready - start the game client
    require.ready(function() 
    {
	   var gameController = new ClientGameController(HOST, PORT);
    })
}, null, '/js/');
//}, null, '/js/');