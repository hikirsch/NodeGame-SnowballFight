var init = function(HTMLFactory)
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

		addEntity: function( anEntityView )
		{
			anEntityView.getElement().appendTo( this.element );
		},

		removeEntity: function( anEntityView )
		{
			anEntityView.getElement().remove();
		},

		getElement: function() {
			return this.element;
		},

		destroy: function() {
			this.element.destroy();
		},
		update: function() {
			this.element.css({
				width: this.controller.getWidth(),
				height: this.controller.getHeight()
			});
		}
	});
};

if (typeof window === 'undefined')
{
	require('../lib/jsclass/core.js');
	FieldView = init();
} else {
	define(['factories/HTMLFactory', 'lib/jsclass/core'], init);
}

