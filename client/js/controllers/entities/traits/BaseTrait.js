var init = function()
{
	return new JS.Class(JS.Command,
	{
		initialize: function(anEntity, commandObject)
		{
			this.traitName = 'BaseTrait';
			this.attachedEntity = anEntity;

			if(!commandObject.hasOwnProperty('execute') || !commandObject.hasOwnProperty('detach')) {
				console.log("(BaseTrait) Child class does not implement 'execute' and 'detach'. Aborting...");
				commandObject = null;
				return;
			}

			var childDetach = commandObject.detach;
			commandObject.detach = function() {
				console.log('detacch')
				this.attachedEntity = null;
			};

			// Take advantage of closure
			this.callSuper(commandObject);
		}
	});
};


if (typeof window === 'undefined')
{
	// We're in node!
	require('js/lib/jsclass/core');
	require('lib/jsclass/command');
	BaseTrait = init();
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/jsclass/core', 'lib/jsclass/command'], init);
}