// Init
var sys 		= require('sys');
var ArgHelper 	= require('./argHelper.js');
var Snowball	= require('./snowball.game.js');

/**
* Optionally creates an HTTP server if dictated in args
**/
var createHttpServer = ArgHelper.getArgumentByNameOrSetDefault('createHttpServer', 'false');
var httpServer = undefined;

if(createHttpServer)
	httpServer = require('./SimpleHTTPServer.js').setPrefix('../client');
//	
console.log(httpServer);
Server = new Snowball.Server({
    'port': Math.abs(ArgHelper.getArgumentByNameOrSetDefault('port', 28785)),
    'status': true,
    'recordFile': './../record[date].js',
    'record': false,
    'server': server
});
Server.run();