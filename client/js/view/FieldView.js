var init = function()
{
	return new JS.Class(
	{
		initialize:  function(controller) {
			this.controller = controller;

			this.createElement();
		},

		createElement: function() {
			this.element = HTMLFactory.field()
				.appendTo('body');
		},

		addPlayer: function( playerView )
		{
			playerView.getElement().appendTo( this.element );
		},

		getElement: function() {
			return this.element;
		},

		destroy: function() {
			this.element.destroy();
		}
	});
};

if (typeof window === 'undefined')
{
	require('../lib/jsclass/core.js');
	FieldView = init();
} else {
	define(['lib/jsclass/core', 'factories/HTMLFactory'], init);
}

