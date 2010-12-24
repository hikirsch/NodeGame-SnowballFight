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

define([ 'lib/jsclass-core'], function( JS ) {
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
});