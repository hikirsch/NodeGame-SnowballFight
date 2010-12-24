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
define([
		'lib/SortedLookupTable',
		'controllers/entities/traits/ClientControlledTrait',
		'controllers/entities/traits/ClientControlledTrait',
		'controllers/entities/traits/CharacterTraitInvulnerable',
		'controllers/entities/traits/PresentTraitHyperShot',
		'controllers/entities/traits/PresentTrait360Shot',
		'controllers/entities/traits/PresentTraitDeflectorShot',
		'controllers/entities/traits/EntityTraitAnimateInFromAlpha',
		'controllers/entities/traits/EntityTraitAnimateInFromLarge'
	],
	function(SortedLookupTable, ClientControlledTrait, ProjectileTraitFreeze, CharacterTraitInvulnerable, PresentTraitHyperShot, PresentTrait360Shot, PresentTraitDeflectorShot, EntityTraitAnimateInFromAlpha, EntityTraitAnimateInFromLarge )
	{
		// Private reference
		var traitTypes = new SortedLookupTable();

		traitTypes.setObjectForKey(ClientControlledTrait, 'ClientControlledTrait');
		traitTypes.setObjectForKey(ProjectileTraitFreeze, 'ProjectileTraitFreeze');
		traitTypes.setObjectForKey(CharacterTraitInvulnerable, 'CharacterTraitInvulnerable');
		traitTypes.setObjectForKey(EntityTraitAnimateInFromAlpha, 'EntityTraitAnimateInFromAlpha');
		traitTypes.setObjectForKey(EntityTraitAnimateInFromLarge, 'EntityTraitAnimateInFromLarge');

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
	}
);
