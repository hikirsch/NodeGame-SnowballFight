define(['factories/HTMLFactory', 'model/GameModel' ], function( HTMLFactory, gameModel ) {
	return new JS.Class(
		{
			initialize: function( controller, aGameModel )
			{
				this.controller = controller;
				this.visible = false;

				this.settings = {
					height: aGameModel.height,
					width: aGameModel.width,
					left: this.controller.getFieldLeft(),
					top: this.controller.getFieldTop()
				};
			},

			createElement: function()
			{
				this.element = HTMLFactory.overlay()
					.hide()
					.css(this.settings)
					.appendTo("body");
			},

			show: function( $ele )
			{
				console.log( $ele );
				
				if( this.element == null )
				{
					this.createElement();
				}
				
				this.element.show();

				$ele
					.appendTo("body")
					.css({
						left: this.settings.left + ( ( this.element.width() - $ele.width() ) / 2 ),
						top: this.settings.top + ( ( this.element.height() - $ele.height() ) / 2 )
					});

			},

			hide: function()
			{
				this.element.hide();
			}
		}
	);
});