define([ 'jquery', 'text!html/server-unavailable.html', 'text!html/join-game.html' ], 
	function( $, serverUnavailable, joinGame  ) {
		return {
			serverUnavailableDialog: function() {
				return $(serverUnavailable);
			},
			
			joinGameDialog: function() 
			{	
				return $(joinGame);
			}
		};
	}
);