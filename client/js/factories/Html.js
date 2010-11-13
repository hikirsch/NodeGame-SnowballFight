define([ 
	'jquery',
	'text!html/server-unavailable.html', 'text!html/join-game.html',
	'text!html/character.html',
	'text!html/field.html',
	'plugins/jquery.tmpl.min' /** this should be last **/
], 
	function( $, serverUnavailable, joinGame, character, field  ) {
		return {
			serverUnavailableDialog: function() {
				return $(serverUnavailable);
			},
			
			joinGameDialog: function() 
			{	
				return $(joinGame);
			},
			
			character: function( data ) {
				return $(character)
					.tmpl( data )
					.addClass( data.theme );
			},
			
			field: function() {
				return $(field);
			}
		};
	}
);