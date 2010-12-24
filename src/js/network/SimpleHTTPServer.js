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
define(['http', 'url', 'fs', 'sys'], function(http, url, fs, sys ) {
	var server = http.createServer(function(req, res)
	{
		var path = this.prefix+url.parse(req.url).pathname;
		fs.readFile(__dirname + path, function(err, data)
		{
			// console.log("(SimpleHTTPServer) Serving page:" + path);

			if (err)
			 return send404(err, res);

			var type = 'text/html';

			if(path.indexOf('js') > -1) type = 'text/javascript';
			else if(path.indexOf('css') > -1) type = 'text/css';

			res.writeHead(200, {'Content-Type':type});
			res.write(data, 'utf8');
			res.end();
		});
	});

	function send404(error, res)
	{
		res.writeHead(404);
		res.write('404:' + error);
		res.end();
	}

	function setPrefix(aPrefix)
	{
		server.prefix = aPrefix;
		sys.inspect(this, true, 10);
	}

	function listen(port)
	{
		server.listen(port);
	}

	return {
		setPrefix: setPrefix,
		listen: listen
	};
});