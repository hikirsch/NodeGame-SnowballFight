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

var init = function(Vector, Rectangle, FieldController, GameEntity, Character, ProjectileModel, Projectile, CharacterView)
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
		},

		// Catch the handleInput so our super's version doesn't get called
		handleInput: function( gameClock ) {}
	});
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('../../lib/jsclass/core.js');
	require('../../lib/Vector');
	require('../../lib/Rectangle');
	require('../FieldController');
	require('../../model/ProjectileModel');
	require('./Projectile');
	require('./Character');
	require('./GameEntity');

	ClientControlledCharacter = init(Vector, Rectangle, FieldController, GameEntity, Character, ProjectileModel, Projectile, undefined);
}
else
{

	// We're on the browser.
	// Require.js will use this file's name to
	define(['lib/Vector',
		'lib/Rectangle',
		'controllers/FieldController',
		'controllers/entities/GameEntity',
		'controllers/entities/Character',
		'model/ProjectileModel',
		'controllers/entities/Projectile',
		'view/CharacterView',
		'lib/jsclass/core'], init);}