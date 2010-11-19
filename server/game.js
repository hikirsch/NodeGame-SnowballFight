/**
 * Optionally creates an HTTP server if dictated in args
 **/
var ArgHelper = require('./lib/ArgHelper.js');
var createHTTPServer = ArgHelper.getArgumentByNameOrSetDefault( 'createHTTPServer', false );
if( createHTTPServer )
{
	var port = Math.abs( ArgHelper.getArgumentByNameOrSetDefault( 'port', 12345 ) );
	var httpServer = require('./network/SimpleHTTPServer.js' );
	httpServer.setPrefix('/../client');
	httpServer.listen( port );
}

/**
 * Start the actual node server.
 */
var sys = require('sys');
var ServerController = require('./controllers/ServerGame.js').Class;
var config = require('../client/js/config.js').Config;
var serverConfig = require('./serverConfig.js').Config;

new ServerController(config, serverConfig).start();