define(['view/BaseView', 'lib/jsclass/core'], function(BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, model ) {
			this.callSuper();
		},

		createElement: function()
		{
			var director = GAMECONFIG.CAAT.DIRECTOR;

			// Grab our model info and create a sprite
			var themeModel = this.getThemeModelByID(this.model.theme);
			var imageCachedName = themeModel.imageSource;
			var imageRef = director.getImage(this.model.theme);
			var caatImage = new CAAT.CompoundImage().
					initialize(imageRef, themeModel.rowCount, themeModel.columnCount);

			this.CAATSprite = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);
			this.CAATSprite.spriteIndex = themeModel.spriteIndex;
			this.CAATSprite.setScaleAnchored(1, 1, 0);


			// Don't create an actorcontainer if its not a character
			if(this.controller.entityType == GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.CHARACTER)
			{
				this.CAATActorContainer = new CAAT.ActorContainer().
					create().
					setBounds(0, 0, this.CAATSprite.width, this.CAATSprite.height);

				this.CAATActorContainer.addChild(this.CAATSprite);
			}

			GAMECONFIG.CAAT.SCENE.addChild(this.CAATActorContainer || this.CAATSprite);
			this.CAATText = null;
		},


		/**
		 * Based on our rotation, we should show a different sprite.
		 */
		update: function()
		{
			var CAATObject = this.CAATActorContainer || this.CAATSprite;
			CAATObject.setLocation(this.controller.getPosition().x - CAATObject.width*0.5,
					this.controller.getPosition().y-CAATObject.height*0.5);

			var actualRotation = this.controller.getRotation();
			if( this.controller.useTransform )
			{
				this.CAATSprite.setRotation( actualRotation );
			}
			else if( actualRotation != 0 )
			{
				actualRotation += 90;
				if(actualRotation < 0)  actualRotation += 359; // Wrap

				// Round to the number of sprites we have
				var roundTo = 45,
					roundedRotation = Math.round(actualRotation / roundTo) * roundTo;

				// spriteIndex = 90 / 45 = 2
				this.CAATSprite.spriteIndex =  ( roundedRotation / roundTo);
			}

			// TODO: Also check if modified
			if(this.controller.nickname && !this.CAATText)
			{
				this.createTextfield(this.controller.nickname);
			}
		},

		/**
		 * ACCESSORS
		 */
		getThemeCodeFromName: function( themeName )
		{
			var currentKey = null,
				matchingKey = null;

			for(currentKey in EntityModel.THEME_MAP ) {
				if( EntityModel.THEME_MAP.hasOwnProperty( currentKey ) )
				{
					if( EntityModel.THEME_MAP[ currentKey ] === themeName ) {
						matchingKey = currentKey;
					}
				}
			}

			console.log('(EntityView)::getThemeCodeFromName', matchingKey);
			return matchingKey;
		},

		createTextfield: function(text)
		{
			if(this.CAATText)
				return this.CAATText;


			console.log('creating text');
			// Create a textfield
    		this.CAATText = new CAAT.TextActor().
            create().
            setFont("11px sans-serif").
            setText(text).
            setBaseline("top").
            setOutline(false).
			setFillStyle("#274b87");

			this.CAATText.textAlign = "center";
			this.CAATText.calcTextSize(GAMECONFIG.CAAT.DIRECTOR);
			this.CAATText.setLocation((this.CAATSprite.width-this.CAATText.width/2 - 5), this.CAATSprite.height+5);
			this.CAATActorContainer.addChild(this.CAATText);
			return this.CAATText;
		}


	});
});

