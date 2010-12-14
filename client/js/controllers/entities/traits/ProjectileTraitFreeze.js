/**
File:
	ProjectileTraitFreeze.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	Hijacks the characters position property so that it never changes
Basic Usage:
 	// Let my character be controlled by the KB
	if(newEntity.connectionID === this.netChannel.connectionID) {
		aCharacter.addTraitAndExecute( new ClientControlledTrait() );
		this.clientCharacter = aCharacter;
	}
*/
var init = function(BaseTrait, Vector)
{
	return new JS.Class("ProjectileTraitFreeze", BaseTrait,
	{
		initialize: function(collisionNormal) {
			this.callSuper();

			this.collisionNormal = collisionNormal;
			this.collisionNormal.mul(-3); // Messin fools up!
		},

		attach: function()
		{
			this.callSuper();

			// Set our theme, and hijack the characters
			this.theme = '1' + this.attachedEntity.theme;
			this.intercept(['handleInput', 'theme']);
		},

		execute: function()
		{
			this.collisionNormal.mul(-10);
			// apply
			this.attachedEntity.velocity.mul(0);
			this.attachedEntity.velocity.add(this.collisionNormal);
			this.detachAfterDelay(4500);
		},

		detach: function() {
			var entity = this.attachedEntity; // Store in var because the super call below will clear the memory
			this.callSuper();
			entity.addTraitAndExecute( new CharacterTraitInvulnerable() );

			console.log("Detach!!!");
		},


		/**
		 * Intercepted propertys
		 */
		handleInput: function()
		{
			// Do nothing! You're frozen!
		}
	});
};


if (typeof window === 'undefined')
{
	// We're in node!
	require('js/controllers/entities/traits/BaseTrait');
	require('js/controllers/entities/traits/CharacterTraitInvulnerable');
	require('js/lib/Vector');
	ProjectileTraitFreeze = init(BaseTrait, Vector);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector', 'controllers/entities/traits/BaseTrait', 'lib/jsclass/core'], init);
}