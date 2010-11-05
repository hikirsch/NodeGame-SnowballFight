/**
File:
	SimpleHTTPServer.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	Listens for HTTP request.
	This class is basically created from the node.js 'HelloWorlds'. 
	There's nothing special about this server, it doesn't do anything fancy
	
Basic Usage: 
	
Version:
	1.0
*/
var http 	= require('http'); 
var	url 	= require('url');
var	fs 		= require('fs');
var sys		= require('sys');

server = http.createServer(function(req, res)
{
	var prefix = '/../client'; // move to class later
	var path = prefix+url.parse(req.url).pathname;
	
	console.log("(SimpleHTTPServer) Serving page:" + path);

	fs.readFile(__dirname + path, function(err, data)
	{
		if (err)
		 return send404(err, res);
		 
		var type = 'text/html';
		
		if(path.indexOf('js') > -1) type = 'text/javascript';
		else if(path.indexOf('css') > -1) type = 'text/css';
		
		res.writeHead(200, {'Content-Type':type})
		res.write(data, 'utf8');
		res.end();
	});
	
	console.log('(SimpleHTTPServer) Serving File:' + path);
});

server.listen(12345);

send404 = function(error, res)
{
	res.writeHead(404);
	res.write('404:' + error);
	res.end();
};

this.setPrefix = function(aPrefix)
{
	this.prefix = aPrefix;
	sys.inspect(this, true, 10);
};