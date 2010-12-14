define(['view/BaseView', 'lib/jsclass/core'], function(BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, model ) {
			this.callSuper();
			this.lastTheme = this.controller.theme
		},

		createElement: function()
		{
			var director = GAMECONFIG.CAAT.DIRECTOR;

			// Grab our model info and create a sprite
			var themeModel = this.themeModel = this.getThemeModelByID(this.model.theme);
			var imageRef = director.getImage(this.model.theme);
			var caatImage = new CAAT.CompoundImage().
					initialize(imageRef, themeModel.rowCount, themeModel.columnCount);

			var actor = null; // will be either SpriteActor or ActorContainer
			actor = this.CAATSprite = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);


			this.CAATSprite.spriteIndex = themeModel.spriteIndex;
			this.CAATSprite.setScaleAnchored(1, 1, 0);


			// Don't create an actorcontainer if its not a character
			if(this.controller.entityType == GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.CHARACTER)
			{
				actor = this.CAATActorContainer = new CAAT.ActorContainer().
					create().
					setBounds(0, 0, this.CAATSprite.width, this.CAATSprite.height);
				actor.addChild(this.CAATSprite);
			}

			GAMECONFIG.CAAT.SCENE.addChild(actor);
			actor.zIndex = themeModel.zIndex;
			this.CAATText = null;
		},


		/**
		 * Based on our rotation, we should show a different sprite.
		 */
		update: function()
		{
			var actor = this.CAATActorContainer || this.CAATSprite;
			actor.setLocation(this.controller.getPosition().x - actor.width*0.5,
					this.controller.getPosition().y-actor.height*0.5);

			// See if anything fancy has occured
			var isInSpecialView = false;
			if(+this.controller.theme > 1000)
			{
				this.lastTheme = this.controller.theme;

				isInSpecialView = true;
				// Figure out what its trying to tell us
				var themeString = this.controller.theme + "";
				var themeMask = themeString.substr(0, 1);

				// frozen
				if(themeMask === '1') {
					this.CAATSprite.spriteIndex = 8;
				} else if (themeMask === '2') {
					isInSpecialView = false;
					this.CAATSprite.alpha = Math.random();
				}


			}

			// Do regular stuff
			var actualRotation = this.controller.getRotation();
			if( this.controller.useTransform ) {
				this.CAATSprite.setRotation( actualRotation * 0.0174532);
			}
			else if( actualRotation != 0 )
			{
				actualRotation += 90;
				if(actualRotation < 0)  actualRotation += 359; // Wrap

				// Round to the number of sprites we have
				var roundTo = 45,
					roundedRotation = Math.round(actualRotation / roundTo) * roundTo;

				// spriteIndex = 90 / 45 = 2
				if(!isInSpecialView) {
					this.CAATSprite.spriteIndex =  ( roundedRotation / roundTo);
					this.CAATSprite.alpha = 1;
				}
			}

			// We got the nickname
			if(this.controller.nickname && !this.CAATText)
				this.createTextfield(this.controller.nickname);


		},

		/**
		 * ACCESSORS
		 */
		createTextfield: function(text)
		{
			if(this.CAATText)
				return this.CAATText;

			// Create a textfield
    		this.CAATText = new CAAT.TextActor().
            create().
            setFont("bold 12px sans-serif").
			setAlpha(0.25).
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

