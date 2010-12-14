/**
File:
	Main.js
Created By:
	Adam Kirschner
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	This is the main class of the game on the client side.
Basic Usage:
 	See index.html // TODO: Update basic usage.
*/
require(['controllers/AbstractClientGame', 'config', 'scratchpad/Animal'], function(AbstractClientGame, config) {
	// Everything ready - start the game client
    require.ready(function()
	{
		var NGK = {
			transformProperty: '',
			transformMoveStart: '',
			transformMoveEnd: ''
		};

		getTransformProperty();


		new AbstractClientGame( config );

		// From Sprite.js
		function getTransformProperty()
		{
			//
			var browserTransform = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform'];

			// Only webkit has transform3d, which turns on opengl rendering!
			var transformMoveStart = ['translate(', 'translate3d(', 'translate(', 'translate('];
			var transformMoveEnd = ["px)", "px, 0px)", "px)", "px)"];
			var p = false;
			var len = browserTransform.length;

			while (len--) {
				var transformType = browserTransform[len];

				if (typeof document.body.style[transformType] !== 'undefined') {
					NGK.transformProperty = transformType;
					NGK.transformMoveStart = transformMoveStart[len];
					NGK.transformMoveEnd = transformMoveEnd[len];

					window.NGK = NGK;
				}
			}
		}
    });
});