define(['view/BaseView', 'lib/jsclass/core'], function(BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, model ) {
			this.callSuper();
			this.themeMask = this.controller.themeMask;
		},

		createElement: function()
		{
			var director = GAMECONFIG.CAAT.DIRECTOR;
			this.themeMaskList = GAMECONFIG.SPRITE_THEME_MASK;

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
		  	this.CAATSprite.anchor= CAAT.Actor.prototype.ANCHOR_CENTER;
			this.CAATText = null;
			// Don't create an actorcontainer if its not a character
			if(this.controller.entityType == GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.CHARACTER)
			{
				actor = this.CAATActorContainer = new CAAT.ActorContainer().
					create().
					setBounds(0, 0, this.CAATSprite.width, this.CAATSprite.height);
				actor.addChild(this.CAATSprite);
			}

			GAMECONFIG.CAAT.SCENE.addChild(actor);

			this.actorWidth = actor.width*0.5;
			this.actorHeight = actor.height*0.5;
			actor.anchor= CAAT.Actor.prototype.ANCHOR_CENTER;
			this.CAATSprite.zIndex = actor.zIndex = themeModel.zIndex;
			this.CAATSprite.mouseEnabled = actor.mouseEnabled = false;

			// We previously had a theme applied - but now we don't want one anymore - clear
			this.isDirtyTheme = false;
		},


		/**
		 * Based on our rotation, we should show a different sprite.
		 */
		update: function()
		{
			var actor = this.CAATActorContainer || this.CAATSprite;

			// dev test
			var fixOffset = true;
			if(fixOffset)
			{
				actor.setLocation(this.controller.getPosition().x - this.actorWidth, this.controller.getPosition().y - this.actorWidth );
			} else {
				actor.setLocation(this.controller.getPosition().x, this.controller.getPosition().y);

			}

			console.log("(EntityView) this.controller.themeMask:", this.controller.themeMask)
			// See if anything fancy has occured
			if(this.controller.themeMask) // 1 means no
			{
				this.themeMask = this.controller.themeMask;
				this.isDirtyTheme = true;


				// TODO: Switch to function-object lookup instead of giant if/else
				// FROZEN
				if( this.themeMask & this.themeMaskList.FROZEN && this.CAATSprite.animationImageIndex.length == 1)
				{
					this.CAATSprite.setAnimationImageIndex( [8,9] );
                	this.CAATSprite.changeFPS= 300;
				}
				// Flashing
				else if (this.themeMask & this.themeMaskList.FLASHING)
				{
					// TODO: HACK - we shouldn't have to reset animation index here
					this.CAATSprite.spriteIndex = 1;
					this.CAATSprite.setAnimationImageIndex([1]);
					this.CAATSprite.setAlpha(Math.random());
				}


			}

			// This is true if we had a theme applied, and its done, but we didn't remove some of its stuff yet
			if( this.controller.themeMask === 0 && this.isDirtyTheme) {
				this.CAATSprite.setAnimationImageIndex([1]);
				this.CAATSprite.alpha = 1;
				this.isDirtyTheme = false;
			}

			// Do regular stuff
			var actualRotation = this.controller.getRotation();
			if( this.controller.useTransform ) {
				this.CAATSprite.setRotation( actualRotation * 0.0174532);
			}
			else if( this.themeMask === 0 && actualRotation != 0 )
			{
				actualRotation += 90;
				if(actualRotation < 0)  actualRotation += 359; // Wrap

				// Round to the number of sprites we have
				var roundTo = 45,
					roundedRotation = Math.round(actualRotation / roundTo) * roundTo;

				// spriteIndex = 90 / 45 = 2
				this.CAATSprite.spriteIndex =  ( roundedRotation / roundTo);
			}

			// We got the nickname
			if(this.controller.nickname && !this.CAATText)
				this.createTextfield(this.controller.nickname);

			if(this.CAATText) {
				this.CAATText.setText("#"  + this.controller.rank + " " + this.controller.nickname);
			}
		},

		/**
		 * ACCESSORS
		 */
		createTextfield: function(text)
		{
			if(this.CAATText) return this.CAATText;

			// Create a textfield
    		this.CAATText = new CAAT.TextActor().
            create().
            setFont("bold 12px sans-serif").
			setAlpha(0.50).
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

