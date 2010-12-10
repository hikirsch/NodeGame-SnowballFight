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
		'text!view/html/overlay.html',
		'text!view/html/navigation.html',
		'text!view/html/footer.html',
		'text!view/html/server-unavailable.html',
		'text!view/html/intro.html',
		'text!view/html/character-select.html',
		'text!view/html/instructions.html',
		'text!view/html/character.html',
		'text!view/html/field.html',
		'text!view/html/entity.html',
		'plugins/jquery.tmpl.min' /** this should be last **/
], init);

if (typeof window === 'undefined')
	HTMLFactory = init();