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

var init = function(ClientControlledTrait, ProjectileTraitFreeze)
{
	// Private reference
	var traitTypes = new SortedLookupTable();

	traitTypes.setObjectForKey(ClientControlledTrait, 'ClientControlledTrait');
	traitTypes.setObjectForKey(ProjectileTraitFreeze, 'ProjectileTraitFreeze');
	traitTypes.setObjectForKey(ProjectileTraitFreeze, 'ProjectileTraitFreeze');

	// Return only accessor
	return {
		createTraitWithName: function(aTraitName)
		{
			return traitTypes.objectForKey(aTraitName);
		}
	};
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('js/controllers/entities/traits/ClientControlledTrait');
	require('js/controllers/entities/traits/ProjectileTraitFreeze');
	TraitFactory = init(ClientControlledTrait, ProjectileTraitFreeze);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (TraitFactory.js), to create a new
	define(['controllers/entities/traits/ClientControlledTrait', 'controllers/entities/traits/ClientControlledTrait', 'lib/jsclass/core'], init);
}