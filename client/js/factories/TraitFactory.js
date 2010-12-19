/**
 File:
 	GameEntityFactory.js
 Created By:
	 Mario Gonzalez
 Project	:
	 Ogilvy Holiday Card 2010
 Abstract:
 	GameEntityFactory is in charge of creating GameEntities
 Basic Usage:
	 // TODO: FILL OUT
 */

var init = function(ClientControlledTrait, ProjectileTraitFreeze, CharacterTraitInvulnerable, PresentTraitHyperShot, PresentTrait360Shot, PresentTraitDeflectorShot, EntityTraitAnimateIn)
{
	// Private reference
	var traitTypes = new SortedLookupTable();

	traitTypes.setObjectForKey(ClientControlledTrait, 'ClientControlledTrait');
	traitTypes.setObjectForKey(ProjectileTraitFreeze, 'ProjectileTraitFreeze');
	traitTypes.setObjectForKey(CharacterTraitInvulnerable, 'CharacterTraitInvulnerable');
	traitTypes.setObjectForKey(EntityTraitAnimateIn, 'EntityTraitAnimateIn');

	// presents

	traitTypes.setObjectForKey(PresentTrait360Shot, 'PresentTrait360Shot');
	traitTypes.setObjectForKey(PresentTraitHyperShot, 'PresentTraitHyperShot');
	traitTypes.setObjectForKey(PresentTraitDeflectorShot, 'PresentTraitDeflectorShot');

	// Present traits
	var presentTraits = [];
	presentTraits.push('PresentTraitHyperShot');
	presentTraits.push('PresentTrait360Shot');
	presentTraits.push('PresentTraitDeflectorShot');

	// Return only accessor
	return {
		createTraitWithName: function(aTraitName)
		{
			return traitTypes.objectForKey(aTraitName);
		},

		/**
		 * Returns one of the present traits at random
		 */
		getRandomPresentTrait: function()
		{
//			return presentTraits[ 1 ]; // dev
			return presentTraits[ Math.floor(Math.random() * presentTraits.length) ];
		}
	};
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('js/controllers/entities/traits/ClientControlledTrait');
	require('js/controllers/entities/traits/CharacterTraitInvulnerable');
	require('js/controllers/entities/traits/ProjectileTraitFreeze');
	require('js/controllers/entities/traits/PresentTraitHyperShot');
	require('js/controllers/entities/traits/PresentTrait360Shot');
	require('js/controllers/entities/traits/PresentTraitDeflectorShot');
	require('js/controllers/entities/traits/EntityTraitAnimateIn');
	TraitFactory = init(ClientControlledTrait, ProjectileTraitFreeze, CharacterTraitInvulnerable, PresentTraitHyperShot, PresentTrait360Shot, PresentTraitDeflectorShot, EntityTraitAnimateIn);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (TraitFactory.js), to create a new
	define(['controllers/entities/traits/ClientControlledTrait',
		'controllers/entities/traits/ClientControlledTrait',
		'controllers/entities/traits/CharacterTraitInvulnerable',
		'controllers/entities/traits/PresentTraitHyperShot',
		'controllers/entities/traits/PresentTrait360Shot',
		'controllers/entities/traits/PresentTraitDeflectorShot',
		'controllers/entities/traits/EntityTraitAnimateIn',
		'lib/jsclass/core'], init);
}