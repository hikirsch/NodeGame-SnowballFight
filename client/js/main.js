var requiredModules = [];

requiredModules.push('tools/Class');
requiredModules.push('GameController');
// WebSocket - Flash
//requiredModules.push('./../flash/swfobject.js');
//requiredModules.push('./../flash/FABridge.js');
//requiredModules.push('./../flash/web_socket.js');
// Snowball Fight
//requiredModules.push('./../bison.js');
//requiredModules.push('./../character.js');
requiredModules.push('./../config.js');
//requiredModules.push('./../controller.js');
//requiredModules.push('./../game.js');


require(requiredModules, function(Class, GameController) 
{
	// Everything ready - start the game client
    require.ready(function() 
    {
	   var gameController = new GameController(HOST, PORT);
    })
}, null, '/js/');
//}, null, '/js/');