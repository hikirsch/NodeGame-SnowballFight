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
		// Regular snowball
		defaultSnowball		: { transferredTraits: 'ProjectileTraitFreeze', initialPosition: null, angle: 0, radius: 11, maxVelocity: 5.5, force: 1, theme: '300', spriteIndex: 0, useTransform: true },

		// Special 'snowball' each character throws when they are in powerup mode
		// SEE: EntityModel.js to see the number mapping ... currently its very ghetto cus the sprite is not in correct vertical order and i i hate
		powerupModeTheme200	: { transferredTraits: '', initialPosition: null, angle: 0, radius: 11, maxVelocity: 6, force: 1, theme: '304', spriteIndex: 4, useTransform: true },
		powerupModeTheme201	: { transferredTraits: '', initialPosition: null, angle: 0, radius: 11, maxVelocity: 6, force: 1, theme: '305', spriteIndex: 5, useTransform: true },
		powerupModeTheme202	: { transferredTraits: '', initialPosition: null, angle: 0, radius: 11, maxVelocity: 6, force: 1, theme: '301', spriteIndex: 1, useTransform: true },
		powerupModeTheme203	: { transferredTraits: '', initialPosition: null, angle: 0, radius: 11, maxVelocity: 6, force: 1, theme: '303', spriteIndex: 3, useTransform: true },
		powerupModeTheme204	: { transferredTraits: '', initialPosition: null, angle: 0, radius: 11, maxVelocity: 6, force: 1, theme: '302', spriteIndex: 2, useTransform: true },
		powerupModeTheme999	: { transferredTraits: '', initialPosition: null, angle: 0, radius: 11, maxVelocity: 6, force: 1, theme: '304', spriteIndex: 2, useTransform: true },

		// Presents are basically projectiles with no velocity
		present				: { transferredTraits: '', initialPosition: null, angle: 0, radius: 14, maxVelocity: 1, force: 1, theme: '400', spriteIndex: 0, useTransform: false }
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