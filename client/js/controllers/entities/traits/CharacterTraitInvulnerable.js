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
		initialize: function(invulnerabilityTime) {
			this.callSuper();
			this.invulnerabilityTime = invulnerabilityTime || 2500;
			this.collisionMask = GAMECONFIG.ENTITY_MODEL.COLLISION_GROUPS.CHARACTER | GAMECONFIG.ENTITY_MODEL.COLLISION_GROUPS.FIELD_ENTITY;
		},

		attach: function(anEntity)
		{
			this.callSuper();
			this.attachedEntity.themeMask |= this.themeMaskList.FLASHING;

			// Set our theme, and hijack the characters
			this.intercept(['collisionMask']);

			this.attachedEntity.collisionCircle.collisionMask = this.collisionMask;
			this.attachedEntity.collisionCircle.collisionMask = this.collisionMask;
		},

		detach: function()
		{
			var entity = this.attachedEntity;
			this.callSuper();

			console.log("1DEATACH!!!", entity.themeMask)
			// restore the collisionmask to the circle
			entity.themeMask &= ~this.themeMaskList.FLASHING;
			console.log("2DEATACH!!!", entity.themeMask)
			entity.collisionCircle.collisionMask = entity.collisionMask;
		},

		execute: function()
		{
			this.detachAfterDelay(this.invulnerabilityTime);
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