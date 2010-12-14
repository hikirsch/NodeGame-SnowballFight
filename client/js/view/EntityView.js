define(['factories/HTMLFactory', 'view/BaseView', 'lib/jsclass/core'], function(HTMLFactory, BaseView)
{
	return new JS.Class( BaseView,
	{
		initialize:  function(controller, model ) {
			this.callSuper();
			this.centerElement();
		},

		createElement: function() {
			var options =
			{
				theme: this.getCssClassFromTheme( this.model.theme )
			};

			var director = GAMECONFIG.CAAT.DIRECTOR;

			var imageCachedName = this.model.theme;
			var imageRef = director.getImage(imageCachedName);

			if(!imageRef) {
				console.log('No image cached by ID:', imageCachedName);
				debugger;
			}
			var caatImage = new CAAT.CompoundImage().
					initialize(imageRef, 1, 10);
			this.CAATSprite = new CAAT.SpriteActor().
						create().
						setSpriteImage(caatImage);

			GAMECONFIG.CAAT.SCENE.addChild(this.CAATSprite);

			this.element = HTMLFactory.entity( options )
				.appendTo('body');
		},

		addEntity: function( anEntityView )
		{
			anEntityView.getElement().appendTo( this.element );
		},

		update: function() {
			this.callSuper();
		}
	});
});

