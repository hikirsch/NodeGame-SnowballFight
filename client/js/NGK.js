/**
File:
	NGK.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	A library for creating realtime muliplayer network games using the browser and Node.js
    NGK stands for Node Game Kit
*/
NGK = (typeof NGK === 'undefined') ? {} : NGK;
var onReady = function() {
	NGK.namespace = function(ns_string)
	{
		var parts = ns_string.split('.'),
			parent = NGK,
			i = 0;


		// strip redundant leading global
		if (parts[0] === "NodeGameKit") {
			parts = parts.slice(1);
		}

		var len = parts.length,
			aPackage = null;
		for (i = 0; i < len; i += 1)
			{
			var singlePart = parts[i];
			// create a property if it doesn't exist
			if (typeof parent[singlePart] === "undefined") {
			   parent[singlePart] = {};
			}
			parent = parent[singlePart];

		}
		return parent;
	};

	return NGK;
};

if (typeof window === 'undefined') {
	NGK = onReady();
} else {
	define(onReady);
}