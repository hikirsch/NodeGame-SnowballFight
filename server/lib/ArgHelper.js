/**
File:
	ArgHelper.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	Allows accessing of process argument as name value pairs.
Basic Usage: 
	var ArgHelper 	= require('./argHelper.js');
	var movespeed = ArgHelper.getArgumentByNameOrSetDefault(movespeed, 3.0); // returns 3.0
	
	// ...inside some other file
	var movespeed = ArgHelper.getArgumentByNameOrSetDefault(movespeed, 1000); // returns 3.0
Version:
	1.0
*/
// Make argument name value pairs, and defaults globally accessible
define( function() {
	var nameValuePairs = {};

	process.argv.forEach(function(val, index, array)
	{
		// not a name-value pair?
		if (val.indexOf("=") > -1)
		{
			// Convert to name-value pair
			var pair = val.split('='),
				key = pair[0],
				value = pair.length > 1 ? pair[1] : "";

			// Convert string based Booleans - This is not the fastest, but it doesn't matter
			// On subsequent calls we never get this far as the value is already set
			if (value == 'true' || value == '1') value = true;
			else if (value == 'false' || value == '0') value = false;

			nameValuePairs[ key ] = value;
		}
	});

	function getArgumentByNameOrSetDefault(anArgumentName, defaultValue)
	{
		var returnValue = null;

		// No needle supplied
		if (anArgumentName == undefined)
		{
			console.log("(ArgHelper) Cannot 'getArgumentByName' with undefined argument!' ");
			return;
		}

		// Already previously set return default
		if ( anArgumentName in nameValuePairs )
		{
			returnValue = nameValuePairs[anArgumentName];
		}
		else
		{
			console.log("(ArgHelper) No match found for '" + anArgumentName + "'" + " in process arguments. Setting value to " + defaultValue + "");

			returnValue = defaultValue;
		}

		return returnValue;
	}

	function outputAllArgumentsToConsole()
	{
		console.log('(ArgHelper) Node created with process arguments:');
		process.argv.forEach(function(val, index, array)
		{
			console.log("\t" + index + " : '" + val + "'");
		});
	}

	outputAllArgumentsToConsole();

	return {
		outputAllArgumentsToConsole: outputAllArgumentsToConsole,
		getArgumentByNameOrSetDefault: getArgumentByNameOrSetDefault
	};
});