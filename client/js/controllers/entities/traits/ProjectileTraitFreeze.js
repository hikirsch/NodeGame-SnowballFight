var init = function()
{
	return new JS.Class("BaseTrait",
	{
		initialize: function()
		{
			that = this;
			this.attachedEntity = null;
			this.interceptedProperties = new SortedLookupTable();
			this.detachTimeout = 0;
			this.displayName = this.klass.displayName; // Work around for bug, but technically we should be able to just use this.displayName
		},

		attach: function(anEntity)
		{
			if(this.attachedEntity != null) { throw {name: "Invalid use of trait", message: "Do not reuse trait instances!"}; };
			this.attachedEntity = anEntity;
		},

		execute: function() {
		   // Override
		},

		detach: function()
		{
			clearTimeout(this.detachTimeout);

			delete this.interceptedProperties;
			this.interceptProperties = null;

			this.attachedEntity.removeTraitWithName(this.displayName);
			this.attachedEntity = null;
		},
	});
};


if (typeof window === 'undefined')
{
	// We're in node!
	require('js/lib/jsclass/core');
	require('js/lib/SortedLookupTable');
	BaseTrait = init();
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/jsclass/core', 'lib/SortedLookupTable'], init);
}