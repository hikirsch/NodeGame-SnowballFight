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
var init = function(BaseTrait, Vector)
{
	return new JS.Class("PresentTraitHypershot", BaseTrait,
	{
		initialize: function(collisionNormal)
		{
			this.callSuper();
			this.fireRate = 125;
		},

		attach: function()
		{
			this.callSuper();

			// Set our theme, and hijack the characters
			this.intercept(['fireRate']);
		},

		execute: function()
		{
			this.detachAfterDelay(4000);
		}
	});
};


if (typeof window === 'undefined')
{
	// We're in node!
	require('js/controllers/entities/traits/BaseTrait');
	require('js/controllers/entities/traits/CharacterTraitInvulnerable');
	require('js/lib/Vector');
	PresentTraitHyperShot = init(BaseTrait, Vector);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector', 'controllers/entities/traits/BaseTrait', 'lib/jsclass/core'], init);
}