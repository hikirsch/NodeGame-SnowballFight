/**
File:
	ClientControlledTrait.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	Gives a 'Character' the ability to be controlled by the keyboard.
Basic Usage:

 	// Let my character be controlled by the KB
	if(newEntity.connectionID === this.netChannel.connectionID) {
		aCharacter.addTraitAndExecute( new ClientControlledTrait() );
		this.clientCharacter = aCharacter;
	}
*/
var init = function(Joystick, BaseTrait)
{
	return new JS.Class("ClientControlledTrait", BaseTrait,
	{
		initialize: function() {
			this.callSuper();
		},

		attach: function(anEntity)
		{
			this.callSuper();
			this.intercept(['constructEntityDescription', 'handleInput']);

			this.attachedEntity.setInput( new Joystick() );
			this.attachedEntity.input.attachEvents();
		},

		detach: function(force)
		{
			debugger;
			this.callSuper();
		},

		/**
		 * Implement our own intercepted version of the methods/properties
		 */
		constructEntityDescription: function(gameTick, wantsFullUpdate)
		{
			return {
				objectID: this.objectID,
				clientID: this.clientID,
				input: this.input.constructInputBitmask()
			}
		},
		// Do nothing
		handleInput: function(gameClock){}
	});
};


if (typeof window === 'undefined')
{
	// We're in node!
	require('js/controllers/entities/traits/BaseTrait');
	require('js/lib/SortedLookupTable');
	require('js/lib/Joystick');
	ClientControlledTrait = init(Joystick, BaseTrait);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Joystick', 'controllers/entities/traits/BaseTrait', 'lib/jsclass/core'], init);
}