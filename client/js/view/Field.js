define(['factories/html'], function( HtmlFactory ) {
	return Class.extend({
		init: function(controller) {
			this.controller = controller;
			
			this.createElement();
		},
		
		createElement: function() {
			this.element = HtmlFactory.field()
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
});