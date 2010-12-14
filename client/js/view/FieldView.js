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
			this.element = HTMLFactory.field()
				.show()
				.insertBefore('footer');
			this.resize( this.model.height, this.model.width );
		},

		resize: function( height, width )
		{
		 	this.element.css({
				 height: height + 'px',
				 width: width + 'px'
			});
		},

		sortChildren: function()
		{
			var childrenList = GAMECONFIG.CAAT.SCENE.childrenList;
			childrenList.sort(function(a, b) {
//			 return a.y-b.y;
			});
		},

		addEntity: function( anEntityView )
		{
//			GAMECONFIG.CAAT.SCENE.addChild(anEntityView.CAATActorContainer);
		},

		removeEntity: function( anEntityView )
		{
			GAMECONFIG.CAAT.SCENE.removeChild(anEntityView.CAATSprite);
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

