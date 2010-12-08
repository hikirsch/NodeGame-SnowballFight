var init = function( $, overlay, navigation, serverUnavailable, joinGame, character, field, entity  ) {
	return {
		navigation: function() {
			return $(navigation)
				.tmpl();
		},

		serverUnavailableDialog: function() {
			return $(serverUnavailable)
				.tmpl();
		},

		joinGameDialog: function()
		{
			return $(joinGame)
				.tmpl();
		},

		character: function( data ) {
			return $(character)
				.tmpl( data )
				.addClass( data.theme );
		},

		field: function() {
			return $(field)
				.tmpl();
		},

		entity: function(data, theme) {
			return $(entity)
				.tmpl(data)
				.addClass( theme );
		},
		overlay: function() {
			return $(overlay)
				.tmpl();
		}
	};
};

define([
		'jquery',
		'text!html/overlay.html',
		'text!html/navigation.html',
		'text!html/server-unavailable.html', 'text!html/join-game.html',
		'text!html/character.html',
		'text!html/field.html',
		'text!html/entity.html',
		'plugins/jquery.tmpl.min' /** this should be last **/
], init);

if (typeof window === 'undefined')
	HTMLFactory = init();