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
		initialize: function(imageSource, rowCount, columnCount, spriteIndex, animationTiming)
		{
			this.imageSource = imageSource;
			var extensionIndex = this.imageSource.indexOf('.')
			this.id = this.imageSource.substring(0, extensionIndex);
			this.rowCount = rowCount;
			this.columnCount = columnCount;
			this.spriteIndex = spriteIndex;
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