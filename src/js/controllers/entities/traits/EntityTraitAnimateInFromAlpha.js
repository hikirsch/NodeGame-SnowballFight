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
define(['lib/jsclass-core', 'controllers/entities/traits/BaseTrait'], function( JS, BaseTrait ) {
	return new JS.Class("EntityTraitAnimateInFromAlpha", BaseTrait,
	{
		initialize: function(collisionNormal)
		{
			this.callSuper();

		},

		attach: function()
		{
			this.callSuper();
			this.attachedEntity.themeMask |= this.themeMaskList.ANIMATE_IN_ALPHA;
		},

		detach: function(force)
		{
			this.attachedEntity.themeMask &= ~this.themeMaskList.ANIMATE_IN_ALPHA;
			this.callSuper();
		},

		execute: function()
		{
			this.detachAfterDelay(5000);
		}
	});
});