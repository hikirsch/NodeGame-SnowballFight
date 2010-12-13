define( [ 'config', 'lib/jsclass/core'], function( config ) {
	return new JS.Class({
		initialize: function( callback ) {
			this.callback = callback;
			this.initAndConnetToWebSocket(config);
		},

		initAndConnetToWebSocket: function( config ) {
			var that = this;
			console.log( 'connecting to: ' + 'ws://' + config.HOST + ':' + config.PORT );
			this.connection = new WebSocket( 'ws://' + config.HOST + ':' + config.PORT );
			this.connection.onopen = function() { that.onConnectionOpened(); };
			this.connection.onmessage = function(messageEvent) { that.onServerMessage(messageEvent); };
			this.connection.onclose = function() { that.onConnectionClosed(); };
		},

		onConnectionOpened: function() {
			console.log( "onConnectionOpened" );
			var newData = {'desiredPort': '1234'};
			var encodedData = BISON.encode( newData );
			this.connection.send( encodedData );
		},

		onServerMessage: function(messageEvent) {
			var decodedMessage = BISON.decode( messageEvent.data );
			this.callback( decodedMessage.actualPort );
			this.connection.close();
		},

		onConnectionClosed: function() { }
	});
});