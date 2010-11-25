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

var init = function(Vector, Rectangle, FieldController, Character, CharacterView)
{
	/**
	 * This is the clients character.
	 * It's exactly like character, except it has an input - and possibly other things later
	 */
	return new JS.Class(Character,
	{
		initialize: function(anObjectID, aClientID, aFieldController)
		{
			this.callSuper();
			this.entityType = 'ClientControlledCharacter';
		},

		/**
		 * Net
		 */
		constructEntityDescription: function()
		{
			this.input.constructInputBitmask();
			return {
				objectID: this.objectID,
				clientID: this.clientID,
				input: this.input.constructInputBitmask()
			}
		}
	});
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('../../lib/jsclass/core.js');
	require('../../lib/Rectangle');
	require('../../lib/Vector');
	require('./GameEntity');
	require('./Character');

	var sys = require('sys');
	ClientControlledCharacter = init(Vector, Rectangle, GameEntity, Character, null);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new

	define(['lib/Vector', 'lib/Rectangle', 'controllers/FieldController', 'controllers/entities/Character', 'view/CharacterView', 'lib/jsclass/core'], init);
}