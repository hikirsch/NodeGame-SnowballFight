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
define(['lib/jsclass-core', 'controllers/entities/traits/BaseTrait'], function(JS, BaseTrait)
{
	return new JS.Class("CharacterTraitInvulnerable", BaseTrait,
	{
		initialize: function(invulnerabilityTime) {
			this.callSuper();
			this.invulnerabilityTime = invulnerabilityTime || 2500;
			this.collisionMask = this.config.ENTITY_MODEL.COLLISION_GROUPS.CHARACTER | this.config.ENTITY_MODEL.COLLISION_GROUPS.FIELD_ENTITY;
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

		detach: function(force)
		{
			var entity = this.attachedEntity;
			this.callSuper();

			// restore the collisionmask to the circle
			entity.themeMask &= ~this.themeMaskList.FLASHING;
			entity.collisionCircle.collisionMask = entity.collisionMask;
		},

		execute: function()
		{
			this.detachAfterDelay(this.invulnerabilityTime);
		}
	});
});