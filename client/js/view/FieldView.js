var init = function(HTMLFactory)
{
	return new JS.Class(
	{
		initialize:  function(controller, model) {
			this.controller = controller;

			this.createElement( model.height, model.width );
		},

		createElement: function( height, width ) {
			this.element = HTMLFactory.field()
				.show()
				.insertAfter('nav');

			this.resize( height, width );
		},

		resize: function( height, width )
		{
		 	this.element.css({
				 height: height + 'px',
				 width: width + 'px'
			});
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

		getLeft: function()
		{
			return this.element.offset().left;
		},

		getTop: function()
		{
			return this.element.offset().top;
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

