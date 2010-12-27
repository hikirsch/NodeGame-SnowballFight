define(['lib/jsclass-core', 'factories/HTMLFactory'], function( JS, HTMLFactory ) {
	return new JS.Class(
		{
			initialize: function( controller )
			{
				this.controller = controller;
				this.visible = false;

				this.settings = {
					height: '100%',
					width: '100%',
					top: 0,
					left: 0
				};

				this.active = [];

				var that = this;
				$(window).resize(function(){ that.resize(); });
			},

			createElement: function( relativeElement )
			{
				if( relativeElement != null || this.relativeElement != null )
				{
					if( relativeElement != null )
					{
						this.relativeElement = relativeElement;
					}

					this.settings = {
						height: this.controller.model.height,
						width: this.controller.model.width,
						margin: 'auto',
						top: this.relativeElement.position().top
					};

				}
				else
				{
					this.settings = {
						height: this.controller.model.height,
						width: this.controller.model.width,
						left: this.controller.getFieldLeft(),
						top: this.controller.getFieldTop()
					};
				}

				this.element = HTMLFactory.overlay()
					.hide()
					.css(this.settings)
					.appendTo("body");
			},

			pushOverlay: function( $ele, relativeElement )
			{
				if( this.active.length > 0 )
				{
					this.activeElement.remove();
					this.activeElement = null;
				}

				if( this.element == null )
				{
					this.createElement( relativeElement );
				}

				this.activeElement = $ele;
				this.active.push( this.activeElement );

				this.element.show();

				this.activeElement.appendTo("body");

				if( "executeOnPush" in this.activeElement && typeof this.activeElement.executeOnPush === "function" ) {
					this.activeElement.executeOnPush( this.activeElement );
				}

				this.resize();
				console.log( '(OverlayManager) Push', $ele, this.active );
			},

			resize: function()
			{
				if( this.element == null )
				{
					this.createElement();
				}

				this.settings.left = ( document.body.offsetWidth - this.controller.model.width ) / 2;
//				this.settings.top = this.controller.getFieldTop();

				if( this.activeElement != null )
				{
					this.activeElement.css({
						left: this.settings.left + ( ( this.element.width() - this.activeElement.width() ) / 2 ),
						top: this.settings.top + ( ( this.element.height() - this.activeElement.height() ) / 2 )
					});
				}

				this.element.css({
					left: this.settings.left,
					top: this.settings.top
				});
			},

			popOverlay: function()
			{
				var ele;

				if( this.activeElement != null )
				{
					ele = this.active.pop();
					this.activeElement.remove();
					this.activeElment = null;
				}

				console.log( '(OverlayManager) Popped', ele, this.active );

				if( this.active.length > 0 )
				{
					ele = this.active.pop();
					console.log('(OverlayManager) Pushing back on: ', ele );
					this.pushOverlay( ele );
				}
				else if( this.element != null )
				{
					this.element.hide();
				}


			},

			getActiveBoxPosition: function(){
				return {
					OverlayLeftStyle: ( ( this.element.width() - this.active.width() ) / 2 ),
					OverlayTopStyle: ( ( this.element.height() - this.active.height() ) / 2 )
				};
			}
		}
	);
});