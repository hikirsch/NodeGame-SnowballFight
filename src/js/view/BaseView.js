define(['lib/jsclass-core', 'factories/HTMLFactory', 'model/EntityModel'], function(JS, HTMLFactory, EntityModel)
{
	return new JS.Class(
	{
		initialize:  function(controller, model, config) {
			this.frameSkip = 3;
			this.setModel( model );
			this.config = config;
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

		/**
		 * Perform necessary functions before drawing the view
		 * Subclasses should override
		 */
		update: function() {},

		getThemeCodeFromName: function( themeName )
		{
			var currentKey = null,
				matchingKey = null;

			console.log('(BaseView) EntityModel.CAAT_THEME_MAP', EntityModel.CAAT_THEME_MAP)

			for(currentKey in EntityModel.CAAT_THEME_MAP )
			{
				if( EntityModel.CAAT_THEME_MAP[ currentKey ].id === themeName ) {
					matchingKey = currentKey;
				}
			}

			console.log('(BaseView)::getThemeCodeFromName', matchingKey);
			return matchingKey;
		},

		getThemeModelByID: function(id)
		{
			return GAMECONFIG.ENTITY_MODEL.CAAT_THEME_MAP[id];
		}
	});
});

