define( [ 'view/managers/QueryStringManager', 'lib/jsclass/core'], function( QueryStringManager ) {
	return new JS.Class({
		initialize: function( config, callback ) {
			this.callback = callback;
			this.config = config;
			this.actualPort = this.config.GAME_PORT;
			this.initAndConnetToWebSocket();
		},

		initAndConnetToWebSocket: function() {
			var that = this;
			this.hasConnected = false;
			this.connection = new WebSocket( 'ws://' + this.config.HOST + ':' + this.config.MASTERSERVER_PORT );
			console.log('(ServerGameSelector) Connecting to ws://' + this.config.HOST + ':' + this.config.MASTERSERVER_PORT);
			this.connection.onopen = function() { that.onConnectionOpened(); };
			this.connection.onmessage = function(messageEvent) { that.onServerMessage(messageEvent); };
			this.connection.onclose = function() { that.onConnectionClosed(); };
		},

		onConnectionOpened: function() {
			console.log('(ServerGameSelector) Connected!');
			var newData = { 'desiredPort': QueryStringManager.getQueryString('game') || this.config.GAME_PORT };
			var encodedData = BISON.encode( newData );
			this.hasConnected = true;
			this.connection.send( encodedData );
		},

		onServerMessage: function( messageEvent ) {
			var decodedMessage = BISON.decode( messageEvent.data );
			this.actualPort = decodedMessage.actualPort;
			console.log("(ServerGameSelector) got response ", decodedMessage );
			this.connection.close();
		},

		onConnectionClosed: function() {
			this.callback( this.actualPort, this.hasConnected );
		}
	});
});