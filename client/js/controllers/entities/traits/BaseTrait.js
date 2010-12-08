var init = function()
{
	return new JS.Class(JS.Command,
	{
		initialize: function(anEntity, commandObject)
		{
			this.traitName |= 'BaseTrait';			// Use name default trait if none supplied - however if this happens there is an error
			this.attachedEntity = anEntity;
			this.attachedEntity.removeTraitWithName(this.traitName);

			if(!commandObject.hasOwnProperty('execute') || !commandObject.hasOwnProperty('detach')) {
				console.log("(BaseTrait) Child class must implement 'execute' and 'detach'. Aborting..."); return;
			}

			// Store some properties to safely avoid memory leaks
			this.commandObject = commandObject;
			this.commandObject.childDetach = commandObject.detach;
			this.commandObject.detach = this.detach;

			// Take advantage of closure
			this.callSuper(commandObject);
		},

		detach: function()
		{
			this.commandObject.childDetach.apply(this);
			this.commandObject.detach = null;
			this.attachedEntity = null;
			this.commandObject = null;
			clearTimeout(this.detachTimeout);
		},

		detachSelfAfterDelay: function(aDelay)
		{
			var that = this;

			this.detachTimeout = setTimeout(function(){that.detach()}, 100);
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