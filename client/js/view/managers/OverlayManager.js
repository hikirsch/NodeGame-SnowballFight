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
				};

				this.active = null;

				var that = this;
				$(window).resize(function(){ that.resize(); });
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

				this.active = $ele;

				this.element.show();

				this.active.appendTo("body");

				this.resize();
			},

			resize: function()
			{
				if( this.element == null ) {
					this.createElement();
				}

				this.settings.left = this.controller.getFieldLeft();
				this.settings.top = this.controller.getFieldTop();

				this.active.css({
					left: this.settings.left + ( ( this.element.width() - this.active.width() ) / 2 ),
					top: this.settings.top + ( ( this.element.height() - this.active.height() ) / 2 )
				});

				this.element.css({
					left: this.settings.left,
					top: this.settings.top
				});
			},
			hide: function()
			{
				if( this.active != null ) {
					this.active.remove();
				}

				if( this.element != null ) {
					this.element.hide();
				}
			}
		}
	);
});