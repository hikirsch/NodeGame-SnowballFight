define(['factories/HTMLFactory'], function( HTMLFactory ) {
	return new JS.Class(
		{
			initialize: function( controller )
			{
				this.controller = controller;
				this.visible = false;
			},

			createElement: function()
			{
				this.element = HTMLFactory.overlay()
					.hide()
					.css({
						height: this.controller.getHeight(),
						width: this.controller.getWidth(),
						top: this.controller.getFieldTop(),
						left: this.controller.getFieldLeft()
					})
					.appendTo("body");
			},

			show: function( ele )
			{
				if( this.element == null )
				{
					this.createElement();
				}
				
				this.element.show();

				console.log( ele );
				$(ele).appendTo("body");
			},

			hide: function()
			{
				this.element.hide();
			}
		}
	);
});