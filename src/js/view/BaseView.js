define(['factories/HTMLFactory', 'model/EntityModel', 'lib/jsclass-core'], function(HTMLFactory, EntityModel )
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

		/**
		 * Perform necessary functions before drawing the view
		 * Subclasses should override
		 */
		update: function() {},

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
		getThemeCodeFromName: function( themeName )
		{
			var currentKey = null,
				matchingKey = null;

			console.log('EntityModel.CAAT_THEME_MAP', EntityModel.CAAT_THEME_MAP)

			for(currentKey in EntityModel.CAAT_THEME_MAP )
			{
				if( EntityModel.CAAT_THEME_MAP[ currentKey ].id === themeName ) {
					matchingKey = currentKey;
				}
			}

			console.log('(EntityView)::getThemeCodeFromName', matchingKey);
			return matchingKey;
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

