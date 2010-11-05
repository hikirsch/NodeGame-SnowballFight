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
	return Class.extend({
		init: function(x, y, width, height)
		{
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		},
	   toString: function()
	   {
	       return '[Rectangle(' + this.x + ', ' + this.y + ',' + this.width + ',' + this.height + ')]';
	   }
	});
}

if (typeof window === 'undefined') {
	require('./Class.js');
	exports.Class = init();
} else {
	define(['lib/Class'], init);
}