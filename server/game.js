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
var config = require('../client/js/config.js').Config;
var serverConfig = require('./serverConfig.js').Config;


require('../client/js/scratchpad/Animal.js');
require('./controllers/Server.js');
var serverInstance = new Server(config, serverConfig);


// Testing JS.Class
var animal = new Animal('Rex');
console.log('Animal', animal.speak("YELLING!!!") ); // Should output: Animal My name is Max and I like BARKING!!!



