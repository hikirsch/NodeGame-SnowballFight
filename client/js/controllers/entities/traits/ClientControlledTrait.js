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
		aCharacter = new ClientControlledTrait(aCharacter);
		aCharacter.setInput( new Joystick() );
		this.clientCharacter = aCharacter;
	}
*/

var init = function(Character)
{
	return new JS.Decorator(Character,
	{
		setInput: function( joystick )
		{
			this.component.setInput( joystick );
			this.component.input.attachEvents();
			this.component.handleInput = function() {};
		},

		constructEntityDescription: function()
		{
			this.component.input.constructInputBitmask();
			return {
				objectID: this.component.objectID,
				clientID: this.component.clientID,
				input: this.component.input.constructInputBitmask()
			}
		},

		// Catch the handleInput so our super's version doesn't get called
		handleInput: function( gameClock ) {}
	});
};

if (typeof window === 'undefined')
{
	// We're in node!
	require('./Character');
	ClientControlledTrait = init(Character);
}
else
{
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['controllers/entities/Character', 'lib/jsclass/core', 'lib/jsclass/decorator'], init);
}