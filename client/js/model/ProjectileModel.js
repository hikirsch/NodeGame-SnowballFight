/**
 File:
 	ProjectileModel.js
 Created By:
	 Mario Gonzalez
 Project	:
	 Ogilvy Holiday Card 2010
 Abstract:
 	Contains the properties for the various types of projectiles
 Basic Usage:
 */

var init = function()
{
	return {
		defaultSnowball	: { transferredTraits: 'ProjectileTraitFreeze', initialPosition: null, angle: 0, radius: 10, maxVelocity: 5, force: 1, theme: '300', useTransform: true },
		superSnowball	: { transferredTraits: 'ProjectileTraitFreeze', initialPosition: null, angle: 0, radius: 15, maxVelocity: 8, force: 1, theme: '306' }
	}
};

if (typeof window === 'undefined')
{
	ProjectileModel = init();
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define([], init);
}