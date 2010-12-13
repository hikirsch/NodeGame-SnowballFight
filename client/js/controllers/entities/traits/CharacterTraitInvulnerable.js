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
	return new JS.Class("CharacterTraitInvulnerable", BaseTrait,
	{
		initialize: function(collisionNormal) {
			this.callSuper();
			this.collisionMask = GAMECONFIG.ENTITY_MODEL.COLLISION_GROUPS.CHARACTER | GAMECONFIG.ENTITY_MODEL.COLLISION_GROUPS.FIELD_ENTITY;
		},

		attach: function(anEntity)
		{
			this.callSuper();

			// Set our theme, and hijack the characters
			this.theme = '2' + this.attachedEntity.theme;
			this.intercept(['collisionMask', 'theme']);
			this.attachedEntity.collisionCircle.collisionMask = this.collisionMask;
		},

		detach: function()
		{
			var entity = this.attachedEntity;
			this.callSuper();

			// restore the collisionmask to the circle
			entity.collisionCircle.collisionMask = entity.collisionMask;
		},

		execute: function()
		{
			this.detachAfterDelay(2500);
		}
	});
};


if (typeof window === 'undefined')
{
	// We're in node!
	require('js/controllers/entities/traits/BaseTrait');
	require('js/lib/Vector');
	CharacterTraitInvulnerable = init(BaseTrait, Vector);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector', 'controllers/entities/traits/BaseTrait', 'lib/jsclass/core'], init);
}