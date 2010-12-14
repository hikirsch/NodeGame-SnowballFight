var init = function( $, overlay, navigation, gameStatus, footer, serverUnavailable, intro, characterSelect, instructions, character, field, entity, results  ) {
	return {
		navigation: function() {
			return $(navigation)
				.tmpl();
		},

		gameStatus: function(obj) {
			return $(gameStatus)
				.tmpl(obj);
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

		characterSelect: function()
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

		entity: function(data) {
			return $(entity)
				.tmpl(data)
				.addClass( data.theme );
		},
		
		results: function( data ) {
			return $(results)
				.tmpl( data );
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
		'text!view/html/game-status.html',
		'text!view/html/footer.html',
		'text!view/html/server-unavailable.html',
		'text!view/html/intro.html',
		'text!view/html/character-select.html',
		'text!view/html/instructions.html',
		'text!view/html/character.html',
		'text!view/html/field.html',
		'text!view/html/entity.html',
		'text!view/html/results.html',
		'plugins/jquery.tmpl.min' /** this should be last **/
], init);

if (typeof window === 'undefined')
	HTMLFactory = init();