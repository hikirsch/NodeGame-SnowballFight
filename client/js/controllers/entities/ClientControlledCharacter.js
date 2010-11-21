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

var init = function(Vector, Rectangle, GameEntity, Character, CharacterView)
{
	/**
	 * This is the clients character.
	 * It's exactly like character, except it has an input - and possibly other things later
	 */
	return new JS.Class(
	{
		initialize: function(anObjectID, aClientID, aFieldController)
		{
			this.callSuper();


			// if the field we're being placed in has a field, then we'll go into it
			if( this.fieldController.view )
			{
				// init the view, pass ourselves as the controller
				this.view = new CharacterView( this, 'smash-tv' );
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
	define(['lib/Vector',
		'lib/Rectangle',
		'controllers/entities/GameEntity',
		'controllers/entities/Character',
		'view/CharacterView',
		'lib/jsclass/core'], init);
}