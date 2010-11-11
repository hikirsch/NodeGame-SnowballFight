// Init
var sys 		= require('sys');
var ArgHelper 	= require('./lib/ArgHelper.js');
require('./ServerGameController.js');

/**
* Optionally creates an HTTP server if dictated in args
**/
var createHTTPServer = ArgHelper.getArgumentByNameOrSetDefault('createHTTPServer', 'false');
if(createHTTPServer) {
	httpServer = require('./SimpleHTTPServer.js');
	httpServer.setPrefix('/../client');
	httpServer.listen(12345);	
}

var gameController = new ServerGameController({
    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
    'status': false,
    'recordFile': './../record[date].js',
    'record': false,
    'server': null
});
gameController.run();