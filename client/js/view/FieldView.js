define(['factories/HTMLFactory', 'view/BaseView', 'lib/jsclass/core'], function(HTMLFactory, BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, model) {
			this.controller = controller;
			this.model = model;

			this.createElement();
		},

		createElement: function() {
			var height = this.model.height,
				width = this.model.width;

			this.element = HTMLFactory.field()
				.show()
				.insertBefore('footer');

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
			anEntityView.getElement()
				.appendTo( this.element );

			anEntityView.centerElement();
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
});

