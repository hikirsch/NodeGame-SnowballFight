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
				this.settings = {
					height: this.controller.getHeight(),
					width: this.controller.getWidth(),
					top: this.controller.getFieldTop(),
					left: this.controller.getFieldLeft()
				};
				
				this.element = HTMLFactory.overlay()
					.hide()
					.css(this.settings)
					.appendTo("body");
			},

			show: function( $ele )
			{
				if( this.element == null )
				{
					this.createElement();
				}
				
				this.element.show();

				$ele
					.appendTo("body")
					.css({
						left: this.settings.left + ( ( this.settings.width - $ele.width() ) / 2 ), 
						top: this.settings.top + ( ( this.settings.height - $ele.height() ) / 2 )
					});

			},

			hide: function()
			{
				this.element.hide();
			}
		}
	);
});