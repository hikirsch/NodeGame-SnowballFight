var init = function(HTMLFactory, BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, theme ) {
			this.callSuper();
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
		}
	});
};

if (typeof window === 'undefined')
{
	require('../lib/jsclass/core.js');
	require('./BaseView.js');
	FieldView = init();
}
else
{
	define(['factories/HTMLFactory', 'view/BaseView', 'lib/jsclass/core'], init);
}

