define(['lib/jsclass/core'], function()
{
	return new JS.Class(
	{
		initialize: function(themeMask)
		{
			var director = GAMECONFIG.CAAT.DIRECTOR,
				layers = GAMECONFIG.CAAT.LAYERS;


			var themeMap = GAMECONFIG.ENTITY_MODEL.CAAT_THEME_MAP['600'];
			var caatImage = new CAAT.CompoundImage().
					initialize(director.getImage('600'), themeMap.rowCount, themeMap.columnCount);

			// Create the notification
			var actor = this.CAATSprite = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);
			actor.mouseEnabled = false;
			actor.setLocation(director.width/2-actor.width/2, 30);
			actor.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			actor.spriteIndex = 4;

			var duration = 500,
				startTime = 0;

			// Fade into view
			actor.alpha = 0;
			this.addScaleBehavior(actor, startTime, duration, 0, 1);
			this.addFadeBehavior(actor, startTime, duration, 0.1, 1);

			// Wait then go away
			var delayedTime = startTime+(duration*1.5) + 1500;
			var fadeOutDuration = 100;
			this.addScaleBehavior(actor, delayedTime, fadeOutDuration, 1, 2);
			var finalBehavior = this.addFadeBehavior(actor, delayedTime, fadeOutDuration*0.9, 1, 0);
			var that = this;
			finalBehavior.addListener( {
				behaviorExpired : function(behavior, time, actor) {
					that.dealloc();
			}});

			GAMECONFIG.CAAT.DIRECTOR.scene.addChild(this.CAATSprite);
			// Place at highest layer
			//layers[layers.length-1].addChild(this.CAATSprite)
		},

		/**
		 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
		 */
		addScaleBehavior: function(actor, starTime, endTime, startScale, endScale)
		{
		   var scaleBehavior = new CAAT.ScaleBehavior();
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			scaleBehavior.startScaleX = scaleBehavior.startScaleY = startScale;  // Fall from the 'sky' !
			scaleBehavior.endScaleX = scaleBehavior.endScaleY = endScale;
			scaleBehavior.setFrameTime(GAMECONFIG.CAAT.SCENE.time + starTime, endTime );
			scaleBehavior.setCycle(false);
			scaleBehavior.setInterpolator( new CAAT.Interpolator().createBounceOutInterpolator(false) );
			actor.addBehavior(scaleBehavior);

			return scaleBehavior
		},

		/**
		 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
		 */
		addFadeBehavior: function(actor, starTime, endTime, startAlpha, endAlpha)
		{
		   var fadeBehavior = new CAAT.AlphaBehavior();
			fadeBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			fadeBehavior.startAlpha = startAlpha;  // Fall from the 'sky' !
			fadeBehavior.endAlpha = endAlpha;
			fadeBehavior.setFrameTime( GAMECONFIG.CAAT.SCENE.time + starTime, endTime );
			fadeBehavior.setCycle(false);
			fadeBehavior.setInterpolator( new CAAT.Interpolator().createExponentialOutInterpolator(2, false) );
			actor.addBehavior(fadeBehavior);

			return fadeBehavior;
		},

/**
 * ACCESSORS
 */
		/**
		 * Returns the actor for this entity.
		 */
		getCAATActor: function() {
			return this.CAATSprite;
		},


/**
 * Memory management
 */
		/**
		 * Deallocate resources for GC
		 */
		dealloc: function(force)
		{
		   if(!this.CAATSprite || !this.CAATSprite.parent)
		   {

			   throw "Does not have parent!"
			   return;
		   }

			console.log("(PowerupAnnounce)::dealloc!");
			this.CAATSprite.parent.removeChild(this.CAATSprite);
			this.CAATSprite = null;
		}
	});
});

