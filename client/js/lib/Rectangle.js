/**
File:
	Rectangle.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	Simple value object
Basic Usage: 
*/
var init = function()
{
	return new JS.Class(
	{
		initialize: function(x, y, width, height)
		{
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		},
		
		toString: function()
		{
		    return '[Rectangle(' + this.x + ', ' + this.y + ',' + this.width + ',' + this.height + ')]';
		},

		getWidth: function()
		{
			return this.width;
		},

		getHeight: function()
		{
			return this.height;
		}
	});
};

if (typeof window === 'undefined') {
	require('../lib/jsclass/core.js');
	Rectangle = init();
} else {
	define(['lib/jsclass/core'], init);
}