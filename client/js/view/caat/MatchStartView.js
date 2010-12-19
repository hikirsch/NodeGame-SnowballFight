define(['lib/jsclass/core'], function()
{
	return new JS.Class(
	{
		initialize:  function(controller, model)
		{
			var director = GAMECONFIG.CAAT.DIRECTOR,
				scene = GAMECONFIG.CAAT.SCENE;

			this.CAATActorContainer = new CAAT.ActorContainer().
					create().
					setBounds(0, 0, director.width, director.height);
			this.CAATActorContainer.zIndex = 2;
			var notificationImages = ['notification_getready', 'notification_3', 'notification_2', 'notification_1', 'notification_go'];
			var len = notificationImages.length,
				i = 0;

			for(i = 0; i < len; i++)
			{
				var image = notificationImages[i];
				var caatImage = new CAAT.CompoundImage().
						initialize(director.getImage(image), 1, 1);

				// Create the notification
				var actor = new CAAT.SpriteActor().
						create().
						setSpriteImage(caatImage);

				actor.mouseEnabled = false;

				actor.setLocation(director.width/2-actor.width/2, director.height/2-actor.height/2);
				actor.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;

				var duration = 600,
					startTime = i*(duration*1.5),
					isLastAnimation = i === len-1;

				actor.alpha = 0;
				this.CAATActorContainer.addChild(actor);
				this.addScaleBehavior(actor, startTime, duration, 5, 1);
				this.addFadeBehavior(actor, startTime, duration, 0.1, 1);

				if(!isLastAnimation)
				{
					this.addScaleBehavior(actor, startTime+(duration*1.5), duration, 1, 0);
					continue;
				}

				// Last one, "Go!" - scale up and fade out
				var delayedTime = startTime+(duration*1.5) + 500;
				var fadeOutDuration = 600;
				this.addScaleBehavior(actor, delayedTime, fadeOutDuration, 1, 5);
				var finalBehavior = this.addFadeBehavior(actor, delayedTime, fadeOutDuration-200, 1, 0);
				var that = this;
				finalBehavior.addListener( {
					behaviorExpired : function(behavior, time, actor) {
						that.dealloc();
				}});
			}

			this.CAATActorContainer.mouseEnabled = false;
			scene.addChild(this.CAATActorContainer)
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
		 * Characters have an ActorContainer, other objects are just Sprites
		 */
		getCAATActor: function() {
			return this.CAATActorContainer;
		},


/**
 * Memory management
 */
		/**
		 * Deallocate resources for GC
		 */
		dealloc: function()
		{
		   if(!this.CAATActorContainer || !this.CAATActorContainer.parent)
		   {
			   throw "Does not have parent!"
		   }

			console.log("(MatchStartView)::dealloc!");
			this.CAATActorContainer.parent.removeChild(this.CAATActorContainer);
		}
	});
});

