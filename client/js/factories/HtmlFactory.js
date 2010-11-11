define([ 'jquery', 'text!tmpl/server-unavailable.html', 'text!tmpl/join-game.html' ], 
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