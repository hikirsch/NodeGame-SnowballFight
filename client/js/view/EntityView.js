define(['view/BaseView', 'lib/jsclass/core'], function(BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, model ) {
			this.callSuper();
			this.themeMask = this.controller.themeMask;

			this.verboseRanking = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
		},

		createElement: function()
		{
			var director = GAMECONFIG.CAAT.DIRECTOR;
			this.themeMaskList = GAMECONFIG.SPRITE_THEME_MASK;
			this.animatedIn = false;

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

		  	this.CAATSprite.anchor= CAAT.Actor.prototype.ANCHOR_CENTER;
			this.CAATText = null;

			// Don't create an actorcontainer if its not a character
			if(this.controller.entityType == GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.CHARACTER)
			{
				actor = this.CAATActorContainer = new CAAT.ActorContainer().
					create().
					setBounds(0, 0, this.CAATSprite.width, this.CAATSprite.height);
				actor.addChild(this.CAATSprite);

				this.createPowerupSprite();

				var that = this;

				// This entity is the client character
				// We have to do this here to call the create function next tick as the prop is set after we've are made
				setTimeout(function(){
							  that.createClientControlledCharacterHighlight()
						  }, 0);
			}

			this.actorWidth = actor.width*0.5;
			this.actorHeight = actor.height*0.5;
			actor.anchor= CAAT.Actor.prototype.ANCHOR_CENTER;
			this.CAATSprite.zIndex = actor.zIndex = themeModel.zIndex;
			this.CAATSprite.mouseEnabled = actor.mouseEnabled = false;

			// We previously had a theme applied - but now we don't want one anymore - clear
			this.isDirtyTheme = false;

			this.update();
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

			// See if anything fancy has occured
			if(this.controller.themeMask) // 1 means no
			{

				// TODO: Switch to function-object lookup instead of giant if/else
				// Animate IN
				if((this.controller.themeMask & this.themeMaskList.ANIMATE_IN) && !(this.themeMask & this.themeMaskList.ANIMATE_IN))
				{
					this.animatedIn = true;
					this.animateInUsingScale(this.CAATSprite, this.CAATSprite.time+30, Math.random() * 600 + 400, 4.5, 1 );
				}
				// FROZEN
				else if( this.controller.themeMask & this.themeMaskList.FROZEN && this.CAATSprite.animationImageIndex.length == 1)
				{
					this.CAATSprite.setAnimationImageIndex( [8,9] );
                	this.CAATSprite.changeFPS= 300;

					// TODO: Move to randomizing function


					var hitSound = ( Math.random() < 0.5 ) ? GAMECONFIG.SOUNDS_MAP.snowballHit1 : GAMECONFIG.SOUNDS_MAP.snowballHit2

					// everyone starts off frozen, dont play sound
					if(GAMECONFIG.CAAT.SCENE.time > 8000)
						GAMECONFIG.CAAT.AUDIO_MANAGER.playSound(hitSound);
				}
				// Flashing
				else if (this.controller.themeMask & this.themeMaskList.FLASHING)
				{
					// TODO: HACK - we shouldn't have to reset animation index here
					this.CAATSprite.spriteIndex = 1;
					this.CAATSprite.setAnimationImageIndex([1]);
					this.CAATSprite.setAlpha(Math.random());
				}

				// Powerup
				if( (this.controller.themeMask & this.themeMaskList.HAS_POWERUP) && !(this.themeMask & this.themeMaskList.HAS_POWERUP) ) // and we don't have it yet
				{
					this.CAATActorContainer.addChild(this.CAATPowerupSprite);

					// Turn the animation back on
					this.CAATPowerupSprite.setFrameTime(this.CAATActorContainer.time, this.CAATActorContainer.time+10000);

					// Scale me up!
					this.animateInUsingScale(this.CAATSprite, this.CAATSprite.time, 700, 2, 1);

					//
//					GAMECONFIG.GENERIC_EVENT_DISPATCHER.dispatchEvent(GAMECONFIG.EVENTS.ON_POWERUP_AQUIRED,{theme: this.controller.themeMask});


					// Tell the world!
					var event = document.createEvent("Event");
					event.initEvent(GAMECONFIG.EVENTS.ON_POWERUP_AQUIRED, true, true);
					event.data = {theme: this.controller.themeMask};
					window.dispatchEvent(event);
				}

				// Set to dirty, and remember new mask
				this.isDirtyTheme = true;
			}

			this.themeMask = this.controller.themeMask;
			// This is true if we had a theme applied, and its done, but we didn't remove some of its stuff yet
			if( this.controller.themeMask === 0 && this.isDirtyTheme)
			{
				this.restoreFromThemeMask();
			}

			// Do regular stuff
			var actualRotation = this.controller.getRotation();
			var untouchedRotation = actualRotation;

			if( this.controller.useTransform ) {
				this.CAATSprite.setRotation( actualRotation * 0.0174532);

			}
			else if(actualRotation != 0 )
			{
				actualRotation += 90;
				if(actualRotation < 0)  actualRotation += 359; // Wrap

				// Round to the number of sprites we have
				var roundTo = 45,
					roundedRotation = Math.round(actualRotation / roundTo) * roundTo;

				// spriteIndex = 90 / 45 = 2

				this.CAATSprite.spriteIndex = ( roundedRotation / roundTo);

				if(this.CAATSprite.spriteIndex === 8) // When we are at 360 degrees, interpret as zero
					this.CAATSprite.spriteIndex = 0;
			}

			// We got the nickname but no textfield, create textfield
			if(this.controller.model.nickname && !this.CAATText)
				this.createTextfield(this.controller.model.nickname);

			// We got text to display
			if(this.CAATText) {
				this.CAATText.setText(this.verboseRanking[this.controller.rank] + " - " + this.controller.model.nickname);
			}
		},

		/**
		 * Restores properties to the CAAT sprite instances
		 * Will be called if 'isDirtyTheme' = true if themeMask is zero.
		 */
		restoreFromThemeMask: function()
		{
			// Remove animation
			if(this.CAATSprite.animationImageIndex.length > 1)
				this.CAATSprite.setAnimationImageIndex([1]);

			// Hide 'powerupsprite'
			if(this.CAATActorContainer && this.CAATPowerupSprite) {
				this.CAATPowerupSprite.setOutOfFrameTime();
			}

			// Restore alpha and turn unset isDirtyTheme
			this.CAATSprite.alpha = 1;
			this.isDirtyTheme = false;
		},

		/**
		 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
		 */
		animateInUsingScale: function(actor, starTime, endTime, startScale, endScale)
		{
		   var scaleBehavior = new CAAT.ScaleBehavior();
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			scaleBehavior.startScaleX = scaleBehavior.startScaleY = startScale;  // Fall from the 'sky' !
			scaleBehavior.endScaleX = scaleBehavior.endScaleY = endScale;
			scaleBehavior.setFrameTime( starTime, endTime );
			scaleBehavior.setCycle(false);
			scaleBehavior.setInterpolator( new CAAT.Interpolator().createBounceOutInterpolator(false) );
			actor.addBehavior(scaleBehavior);
		},

		createPowerupSprite: function()
		{
			var director = GAMECONFIG.CAAT.DIRECTOR;

			/**
			 * Create a sprite to show the powerup state
			 */
			var powerupThemeModel= this.getThemeModelByID('500'),
				imageRef = director.getImage('500'),
				caatImage = new CAAT.CompoundImage().
						initialize(imageRef, powerupThemeModel.rowCount, powerupThemeModel.columnCount);

			this.CAATPowerupSprite = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);

			this.CAATPowerupSprite.spriteIndex = powerupThemeModel.spriteIndex;
			this.CAATPowerupSprite.anchor= CAAT.Actor.prototype.ANCHOR_CENTER;
			this.CAATPowerupSprite.setLocation(5, -10);

			this.CAATPowerupSprite.setAnimationImageIndex( [0, 1, 2, 3, 2, 1] );
			this.CAATPowerupSprite.changeFPS = 60;
		},

		createClientControlledCharacterHighlight: function()
		{
			if(this.controller !== GAMECONFIG.CAAT.CLIENT_CHARACTER)
				return;


			var director = GAMECONFIG.CAAT.DIRECTOR;
			/**
			 * Create a sprite to show the powerup state
			 */
			var powerupThemeModel= this.getThemeModelByID('501'),
				imageRef = GAMECONFIG.CAAT.DIRECTOR.getImage('501'),
				caatImage = new CAAT.CompoundImage().
						initialize(imageRef, powerupThemeModel.rowCount, powerupThemeModel.columnCount);

			var actor = this.CAATCharacterHighlight = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);

			this.CAATCharacterHighlight.spriteIndex = powerupThemeModel.spriteIndex;
			this.CAATCharacterHighlight.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			this.CAATCharacterHighlight.setLocation(this.CAATSprite.width*-0.5 - 6, this.CAATSprite.height/2 - 10);

			// TODO: Hack - setZOrder should work but it crashes out so this is the only way to place'behind'
			this.CAATCharacterHighlight.parent = this.CAATActorContainer;
			this.CAATActorContainer.childrenList.unshift(this.CAATCharacterHighlight);
		},

		/**
		 * ACCESSORS
		 */
		createTextfield: function(text)
		{
			if(this.CAATText) return this.CAATText;

			var isClient = this.controller === GAMECONFIG.CAAT.CLIENT_CHARACTER;

			// Create a textfield
    		this.CAATText = new CAAT.TextActor().
            create().
            setFont("bold 10px sans-serif").
			setAlpha(0.6).
            setText(text).
            setBaseline("top").
            setOutline(false).
			setFillStyle(isClient ? "#9E0000" : "#274b87");

			this.CAATText.textAlign = "center";
			this.CAATText.calcTextSize(GAMECONFIG.CAAT.DIRECTOR);
			this.CAATText.setLocation((this.CAATSprite.width-this.CAATText.width/2 - 8), this.CAATSprite.height-1);
			this.CAATActorContainer.addChild(this.CAATText);
			return this.CAATText;
		},

		/**
		 * Returns the actor for this entity.
		 * Characters have an ActorContainer, other objects are just Sprites
		 */
		getCAATActor: function() {
			return this.CAATActorContainer || this.CAATSprite;
		}
	});
});

