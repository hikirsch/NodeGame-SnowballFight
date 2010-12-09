define(['factories/HTMLFactory', 'model/GameModel' ], function( HTMLFactory, gameModel ) {
	return new JS.Class(
		{
			initialize: function( controller, aGameModel )
			{
				this.controller = controller;
				this.visible = false;

				this.settings = {
					height: '100%',
					width: '100%',
					top: 0,
					left: 0
				}

				this.active = null;
			},

			createElement: function()
			{
				this.settings = {
					height: this.controller.model.height,
					width: this.controller.model.width,
					left: this.controller.getFieldLeft(),
					top: this.controller.getFieldTop()
				};

				this.element = HTMLFactory.overlay()
					.hide()
					.css(this.settings)
					.appendTo("body");
			},

			show: function( $ele )
			{
				if( this.active != null )
				{
					this.active.remove();
					this.active = null;
				}
				
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

				this.active = $ele;

			},

			hide: function()
			{
				this.element.hide();
			}
		}
	);
});