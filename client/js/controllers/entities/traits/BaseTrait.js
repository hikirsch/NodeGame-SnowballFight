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

		detachAfterDelay: function(aDelay)
		{
			var that = this;
			this.detachTimeout = setTimeout( function(){ that.detach() }, aDelay);
		},

		/**
		 * Intercept properties from the entity we are attached to.
		 * For example, if we intercept handleInput, then our own 'handleInput' function gets called.
		 * We can reset all the properties by calling, this.restore();
		 * @param arrayOfProperties
		 */
		intercept: function(arrayOfProperties) {
			var len = arrayOfProperties.length;
			while(len--) {
				var aKey = arrayOfProperties[len];
				this.interceptedProperties.setObjectForKey(this.attachedEntity[aKey], aKey);
				this.attachedEntity[aKey] = this[aKey];
			}
		},

		/**
		 * Restores traits that were intercepted.
		 * Be sure to call this when removing the trait!
		 */
		restore: function() {
			this.interceptedProperties.forEach(function(key, aStoredProperty) {
				this.attachedEntity[key] = aStoredProperty;
			}, this );
		}
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