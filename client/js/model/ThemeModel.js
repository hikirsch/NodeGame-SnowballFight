/**
 File:
 GameEntityFactory.js
 Created By:
 Mario Gonzalez
 Project	:
 Ogilvy Holiday Card 2010
 Abstract:
 GameEntityFactory is in charge of creating GameEntities
 Basic Usage:
 // TODO: FILL OUT
 */

var init = function()
{
	return new JS.Class(
	{
		initialize: function(imageSource, rowCount, columnCount, spriteIndex, zIndex, animationTiming)
		{
			this.imageSource = imageSource;

			// The id is the image name
			var extensionIndex = this.imageSource.indexOf('.')
			this.id = this.imageSource.substring(0, extensionIndex);

			// Sprite sheet consist of rows and columns, of box's
			this.rowCount = rowCount;
			this.columnCount = columnCount;

			// Current location in the sprite index to render
			this.spriteIndex = spriteIndex;

			// zOrdering
			this.zIndex = zIndex;
			this.animationTiming = animationTiming || 0;
		}
	});
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('js/lib/jsclass/core.js');
	ThemeModel = init();
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/jsclass/core'], init);
}