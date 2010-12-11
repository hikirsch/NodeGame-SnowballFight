define(['factories/HTMLFactory', 'view/BaseView', 'lib/jsclass/core'], function(HTMLFactory, BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, theme ) {
			this.callSuper();
			this.centerElement();
		},

		createElement: function() {
			var options = {
				nickName: this.controller.getNickName()
			};

			this.element = HTMLFactory.entity( options, this.getCssClassFromTheme( this.theme ) )
				.appendTo('body');
		},

		addEntity: function( anEntityView )
		{
			anEntityView.getElement().appendTo( this.element );
		},

		update: function() {
			this.callSuper();
			this.centerElement();
		}
	});
});

