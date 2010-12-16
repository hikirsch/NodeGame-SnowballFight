
// Use ArgHelper to get optional command line arguments
var ArgHelper = require('./lib/ArgHelper.js');
SYS = require('sys');  // This is a really good example of when a global, is actually the best option!

/**
* Optionally creates an HTTP server if dictated in args
**/
var createHTTPServer = ArgHelper.getArgumentByNameOrSetDefault( 'createHTTPServer', false );
var configLocation = ArgHelper.getArgumentByNameOrSetDefault( 'configLocation', 'js/config.js' );

if( createHTTPServer ) {
	var port = ArgHelper.getArgumentByNameOrSetDefault( 'port', 12345 );
	var httpServer = require('./network/SimpleHTTPServer.js' );
	httpServer.setPrefix('/../client');
	httpServer.listen( port );
}

/**
* Start the node server.
*/
// Add our two paths here for a more 'import' like syntax when requiring files
require.paths.unshift('./');
require.paths.unshift('../client'); // We still want to know when we're going into client/, however we don't want ../../../client/


require('network/Server.js');
var config = require(configLocation).Config;
var serverConfig = require('serverConfig.js').Config;
var serverInstance = new Server(config, serverConfig);



