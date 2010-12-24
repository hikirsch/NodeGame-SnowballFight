/**
File:
	ProjectileTraitFreeze.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	Hijacks the characters shooting speed to allow for faster shooting
Basic Usage:
 	// Let my character be controlled by the KB
	if(newEntity.connectionID === this.netChannel.connectionID) {
		aCharacter.addTraitAndExecute( new ClientControlledTrait() );
		this.clientCharacter = aCharacter;
	}
*/
var init = function(BaseTrait, EntityModel)
{
	return new JS.Class("PresentTraitHypershot", BaseTrait,
	{
		initialize: function(collisionNormal)
		{
			this.callSuper();
			this.fireRate = 200;
		},

		attach: function()
		{
			this.callSuper();
			// Set our theme, and hijack the characters
			this.intercept(['fireRate', 'getProjectileModel', 'onProjectileFired']);
			this.attachedEntity.themeMask |= this.themeMaskList.HAS_POWERUP;
		},

		detach: function(force)
		{
			this.attachedEntity.themeMask &= ~this.themeMaskList.HAS_POWERUP;
			this.callSuper();
		},

		execute: function()
		{
			this.detachAfterDelay(4000);
		},

		/**
		 * Hijacked methods
		 */
		getProjectileModel: function()
		{
			// Use a fancy looking projectile
			var model = ProjectileModel['powerupModeTheme'+this.theme];
			model.transferredTraits = ProjectileModel.defaultSnowball.transferredTraits;
			return model;
		},

		onProjectileFired: function(projectile)
		{
		  	projectile.themeMask &= ~GAMECONFIG.SPRITE_THEME_MASK.DESTROY_ON_FIELD_ENTITY_HIT;
		}
	});
};


if (typeof window === 'undefined') {
	// We're in node!
	require('js/controllers/entities/traits/BaseTrait');
	require('js/model/EntityModel');
	PresentTraitHyperShot = init(BaseTrait, EntityModel);

} else {
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['controllers/entities/traits/BaseTrait', 'model/EntityModel', 'lib/jsclass-core'], init);
}