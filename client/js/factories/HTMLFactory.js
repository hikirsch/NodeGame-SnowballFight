var init = function( $, overlay, navigation, footer, serverUnavailable, intro, characterSelect, instructions, character, field, entity  ) {
	return {
		navigation: function() {
			return $(navigation)
				.tmpl();
		},

		serverUnavailableDialog: function() {
			return $(serverUnavailable)
				.tmpl();
		},

		footer: function() {
			return $(footer)
				.tmpl();
		},

		intro: function()
		{
			return $(intro)
				.tmpl();
		},

		instructions: function()
		{
			return $(instructions)
				.tmpl();
		},

		joinGameDialog: function()
		{
			return $(characterSelect)
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
		'text!html/footer.html',
		'text!html/server-unavailable.html',
		'text!html/intro.html',
		'text!html/character-select.html',
		'text!html/instructions.html',
		'text!html/character.html',
		'text!html/field.html',
		'text!html/entity.html',
		'plugins/jquery.tmpl.min' /** this should be last **/
], init);

if (typeof window === 'undefined')
	HTMLFactory = init();