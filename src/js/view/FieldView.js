define(['lib/jsclass-core', 'factories/HTMLFactory', 'view/BaseView'], function(JS, HTMLFactory, BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, model) {
			this.controller = controller;
			this.model = model;

			this.createElement();
		},

		onCAATInitialized:function(aCATDirector)
		{
			// create 3 layers, zero based
			GAMECONFIG.CAAT.LAYERS = this.CAATLayers = [this.createCAATLayer(aCATDirector), this.createCAATLayer(aCATDirector), this.createCAATLayer(aCATDirector), this.createCAATLayer(aCATDirector)]
		},

		createCAATLayer: function(aCATDirector)
		{
	       var layer = new CAAT.ActorContainer().
				   create().
				   setBounds(0, 0, aCATDirector.width, aCATDirector.height);

			layer.setFrameTime(0, Number.MAX_VALUE);
			GAMECONFIG.CAAT.SCENE.addChild(layer);

			return layer;
		},

		createElement: function() {
			this.element = HTMLFactory.field()
				.show()
				.insertAfter('#game-status');

			this.resize( this.model.height, this.model.width );
		},

		resize: function( height, width )
		{
		 	this.element.css({
				 height: height + 'px',
				 width: width + 'px'
			});
		},

		/**
		 * @depricated
		 */
		sortChildren: function()
		{
			console.warn("(FieldView) This function is depricated!");
			return;

			var childrenList = GAMECONFIG.CAAT.SCENE.childrenList;
			childrenList.sort(function(a, b) {
				var comparisonResult = 0;
				if(a.zIndex > b.zIndex) comparisonResult = 1;
				else if(a.zIndex < b.zIndex) comparisonResult = -1;
				return comparisonResult;
			});
		},

		addEntity: function( anEntityView )
		{
			var layer = this.CAATLayers[anEntityView.theme.zIndex];
			if(!layer) console.log("(FieldView) layer is null!");

			var actor = anEntityView.getCAATActor();
			actor.setFrameTime(0, Number.MAX_VALUE);
			layer.addChild(actor);
		},

		removeEntity: function( anEntityView )
		{
			var actor = anEntityView.getCAATActor();
			actor.setOutOfFrameTime();
			actor.setDiscardable(true);
		},

		getElement: function() {
			return this.element;
		},

		dealloc: function() {

			// Remove all the CAAT layers
			for(var i = 0; i < this.CAATLayers.length; i++) {
				this.CAATLayers[i].emptyChildren();
				GAMECONFIG.CAAT.SCENE.removeChild(this.CAATLayers[i]);
			}
			this.element.remove();
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

