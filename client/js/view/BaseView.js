define(['factories/HTMLFactory', 'model/EntityModel', 'lib/jsclass/core'], function(HTMLFactory, EntityModel )
{
	return new JS.Class(
	{
		initialize:  function(controller, model) {
			this.frameSkip = 3;
			this.setModel( model );
			this.controller = controller;
			this.theme = this.getThemeModelByID( this.model.theme );

			// our default position is north
			this.currentRotation = 0;
			this.frameReadyForAnimation = 0;
			this.changed = false;

			this.createElement();
		},

		setModel: function( model )
		{
			this.model = model;
		},

		removeEntity: function( anEntityView )
		{
			anEntityView.getElement().remove();
		},

		getElement: function() {
			return this.element;
		},

		destroy: function() {
			this.element.destroy();
		},
		
		update: function()
		{
			// the position
//			this.element.css({
//				'left': this.controller.getPosition().x,
//				'top': this.controller.getPosition().y
//			});

//			if( this.controller.theme != this.model.theme ) {
//				if( this.controller.theme >= 1000 && this.controller.theme < 2000 )
//				{
//					this.hideInvisible();
//					this.showStunned();
//				}
//				else if( this.controller.theme >= 2000 && this.controller.theme < 3000 )
//				{
//					this.hideStunned();
//					this.showInvisible();
//				}
//
//				this.changed = true;
//			}
//			else if( this.changed )
//			{
//				this.hideStunned();
//				this.hideInvisible();
//				this.changed = false;
//				this.frameReadyForAnimation = 0;
//			}


			// the sprite
//			this.adjustSprite();
		},

		showInvisible: function()
		{
			this.frameReadyForAnimation--;

			if( this.frameReadyForAnimation < 0 )
			{
				this.frameReadyForAnimation = this.frameSkip;

				this.element.toggleClass('hide');
			}
		},

		hideInvisible: function()
		{
			this.element.removeClass('hide');
		},

		showStunned: function()
		{
			this.frameReadyForAnimation--;

			if( this.frameReadyForAnimation < 0 ) {
				if( this.element.hasClass('stars-1') )
				{
					this.frameReadyForAnimation = this.frameSkip;
					this.element
						.removeClass('stars-1')
						.addClass('stars-2');
				}
				else
				{
					this.frameReadyForAnimation = this.frameSkip;

					this.element
						.removeClass('stars-2')
						.addClass('stars-1');
				}
			}
		},

		hideStunned: function()
		{
			this.element
				.removeClass('stars-1')
				.removeClass('stars-2')
		},

		centerElement: function()
		{
			this.element.css({
				'margin-left': - ( this.element.width() / 2 ),
				'margin-top': - ( this.element.height() / 2 )
			});
		},

		getThemeModelByID: function(id)
		{
			return GAMECONFIG.ENTITY_MODEL.CAAT_THEME_MAP[id];
		}
	});
});

