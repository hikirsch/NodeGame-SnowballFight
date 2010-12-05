/**
* Optionally creates an HTTP server if dictated in args
**/
// Use ArgHelper to get optional command line arguments
var ArgHelper = require('./lib/ArgHelper.js');

var createHTTPServer = ArgHelper.getArgumentByNameOrSetDefault( 'createHTTPServer', false );
if( createHTTPServer ) {
	var port = ArgHelper.getArgumentByNameOrSetDefault( 'port', 12345 );
	var httpServer = require('./network/SimpleHTTPServer.js' );
	httpServer.setPrefix('/../client');
	httpServer.listen( port );
}

/**
* Start the actual node server.
*/
SYS = require('sys');
var config = require('../client/js/config.js').Config;
var serverConfig = require('./serverConfig.js').Config;
require('../client/js/scratchpad/Animal.js');
require('./network/Server.js');
var serverInstance = new Server(config, serverConfig);



