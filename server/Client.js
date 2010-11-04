(function(){
	this.Client = Class.extend(
	{
		init: function( aServer, aConnection, aRecord )
		{
			this.conn = aConnection;
			this.record = aRecord;
			this.$ = aServer;
			
		},
		onMessage: function(msg) { },
		
		sendMessage: function( anEncodedMessage ) 
		{
			this.conn.send( anEncodedMessage );
		},
	}); // close extend
})(); // close anon function