// Init

var Snowball = require('./snowball.game.js');

Server = new Snowball.Server({
    'port': Math.abs(process.argv[2]) || 28785,
    'status': true,
    'recordFile': './../record[date].js',
    'record': false
});
Server.run();