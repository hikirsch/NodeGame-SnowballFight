/**
File:
	// TODO: FILL OUT
Created By:
	// TODO: FILL OUT
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	// TODO: FILL OUT
Basic Usage:
 	// TODO: FILL OUT
*/

var init = function()
{
	return new JS.Class(
	{
		initialize: function()
		{

		}
	});
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('../../lib/jsclass/core.js');
	require('../../lib/Rectangle');
	require('../../lib/Vector');
	GameEntity = init();
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/jsclass/core', 'lib/Vector', 'lib/Rectangle', 'view/CharacterView'], init);
}