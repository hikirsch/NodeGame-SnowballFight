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

var init = function(BaseTrait, Joystick)
{
	return new JS.Class(BaseTrait,
	{
		initialize: function(anEntity)
		{
			this.traitName = 'ClientControlledTrait';

			// Take advantage of closure
			var that = this;

			// console.log(this.setInput)
			this.callSuper(anEntity,
			{
				// Hijack the methods
				execute: function()
				{
					this.attachedEntity.setInput( new Joystick() );
					this.attachedEntity.input.attachEvents();
//
					this.attachedEntity.constructEntityDescription = this.constructEntityDescription;
					this.attachedEntity.handleInput = this.handleInput;
				},

				// If we needed to we could store the old method references
				// and set the back in this function
				detach: function()
				{
				}
			});
		},

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

if (typeof window === 'undefined') {
	// We're in node!
	require('js/controllers/entities/Character');
	require('js/lib/Joystick');
	ClientControlledTrait = init(BaseTrait, Joystick);
} else {
	define(['controllers/entities/traits/BaseTrait', 'lib/Joystick', 'lib/jsclass/core', 'lib/jsclass/command'], init);
}