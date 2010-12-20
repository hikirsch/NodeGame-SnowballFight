/**
File:
	ProjectileTraitFreeze.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	When detected on the client side will cause entity to be animated in via scale
Basic Usage:
*/
var init = function(BaseTrait, Vector)
{
	return new JS.Class("EntityTraitAnimateInFromSmall", BaseTrait,
	{
		initialize: function(collisionNormal)
		{
			this.callSuper();

		},

		attach: function()
		{
			this.callSuper();
			this.attachedEntity.themeMask |= this.themeMaskList.ANIMATE_IN_SMALL;
		},

		detach: function()
		{
			this.attachedEntity.themeMask &= ~this.themeMaskList.ANIMATE_IN_SMALL;
			this.callSuper();
		},

		execute: function()
		{
			this.detachAfterDelay(5000);
		}
	});
};


if (typeof window === 'undefined')
{
	// We're in node!
	require('js/controllers/entities/traits/BaseTrait');
	require('js/controllers/entities/traits/CharacterTraitInvulnerable');
	require('js/lib/Vector');
	EntityTraitAnimateInFromSmall = init(BaseTrait, Vector);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector', 'controllers/entities/traits/BaseTrait', 'lib/jsclass/core'], init);
}