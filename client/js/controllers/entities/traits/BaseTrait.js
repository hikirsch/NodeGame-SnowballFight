/**
File:
	BaseTrait.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	Traits work by effectively 'hi-jacking' properties of their attachedEntity.
 	These properties can by functions, or non-primative data types.

 	For example to make an entity invincable for a period of time you might make a trait like this

 [PSUEDO CODE START]
 	// Inside a trait subclass
	attach: function(anEntity)
	{
		this.callSuper();
		this.intercept(['onHit', 'getShotPower']);
	},

 	onHit: function() {
 		// Do nothing, im invincible!
 	},

 	getShotStrength: function() {
 		return 100000000; // OMGBBQ! Thats high!
 	}
 [PSUEDO CODE END]

 	Be sure to call restore before detaching the trait!

Basic Usage:

 	// Let my character be controlled by the KB
	if(newEntity.connectionID === this.netChannel.connectionID) {
		aCharacter.addTraitAndExecute( new ClientControlledTrait() );
		this.clientCharacter = aCharacter;
	}
*/
var init = function()
{
	return new JS.Class("BaseTrait",
	{
		initialize: function()
		{
			this.attachedEntity = null;
			this.interceptedProperties = new SortedLookupTable();
			this.detachTimeout = 0;
			this.themeMaskList = GAMECONFIG.SPRITE_THEME_MASK;

			// If a trait can stack, then it doesn't matter if it's already attached.
			// If it cannot stack, it is not applied if it's currently active.
			// For example, you can not be frozen after being frozen.
			// However you can be sped up multiple times
			this.canStack = false;

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

		/**
		 * Detaches a trait from an 'attachedEntity' and restores the properties
		 */
		detach: function()
		{
			clearTimeout(this.detachTimeout);

			this.restore();

			delete this.interceptedProperties;
			this.interceptProperties = null;
			this.attachedEntity = null;
		},

		detachAfterDelay: function(aDelay)
		{
			var that = this;
			this.detachTimeout = setTimeout( function(){
				that.attachedEntity.removeTraitWithName(that.displayName);
			}, aDelay);
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