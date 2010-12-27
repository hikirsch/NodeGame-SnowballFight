define(['lib/jsclass-core', 'factories/HTMLFactory'], function(JS, HTMLFactory)
{
	return new JS.Class(
	{
		initialize:  function(controller, model, config) {
			this.controller = controller;
			this.setModel( model );
			this.config = config;

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

			console.log('(BaseView) EntityModel.CAAT_THEME_MAP', this.config.ENTITY_MODEL.CAAT_THEME_MAP)

			for(currentKey in this.config.ENTITY_MODEL.CAAT_THEME_MAP )
			{
				if( this.config.ENTITY_MODEL.CAAT_THEME_MAP[ currentKey ].id === themeName ) {
					matchingKey = currentKey;
				}
			}

			console.log('(BaseView)::getThemeCodeFromName', matchingKey);
			return matchingKey;
		},

		getThemeNameFromCode: function( themeName )
		{
			return this.config.ENTITY_MODEL.CAAT_THEME_MAP[ themeName ].id;
		},

		getThemeModelByID: function(id)
		{
			return this.config.ENTITY_MODEL.CAAT_THEME_MAP[id];
		}
	});
});

