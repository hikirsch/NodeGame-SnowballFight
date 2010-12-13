define(['factories/HTMLFactory', 'view/BaseView', 'lib/jsclass/core'], function(HTMLFactory, BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, model ) {
			this.callSuper();
			this.centerElement();
		},

		createElement: function() {
			var options =
			{
				theme: this.getCssClassFromTheme( this.model.theme )
			};

			this.element = HTMLFactory.entity( options )
				.appendTo('body');
		},

		addEntity: function( anEntityView )
		{
			anEntityView.getElement().appendTo( this.element );
		},

		update: function() {
			this.callSuper();
		}
	});
});

