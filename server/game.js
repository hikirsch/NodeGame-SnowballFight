// Init
var sys 		= require('sys');
var ArgHelper 	= require('./argHelper.js');
//var AbstractGameController = require('./../client/js/AbstractGameController.js');
require('./ServerGameController.js');

/**
* Optionally creates an HTTP server if dictated in args
**/
var createHttpServer = ArgHelper.getArgumentByNameOrSetDefault('createHttpServer', 'false');
if(createHttpServer)
	httpServer = require('./SimpleHTTPServer.js').setPrefix('../client');

var gameController = new ServerGameController({
    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
    'status': false,
    'recordFile': './../record[date].js',
    'record': false,
    'server': null
});
gameController.run();