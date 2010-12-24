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
define(
	[
		'lib/jsclass-core',
		'lib/Joystick',
		'controllers/entities/traits/BaseTrait'
	], function(JS, Joystick, BaseTrait)
	{
		return new JS.Class("ClientControlledTrait", BaseTrait,
		{
			initialize: function(aFieldController, aCircleManager)
			{
				this.fieldController = aFieldController;
				this.circleManager = aCircleManager;

				this.callSuper();
			},

			attach: function(anEntity)
			{
				this.callSuper();
				this.intercept(['tick', 'handleInput']);

				this.attachedEntity.setInput( new Joystick() );
				this.attachedEntity.input.attachEvents();
			},

			/**
			 * Implement our own intercepted version of the methods/properties
			 */
			tick: function(speedFactor, gameClock)
			{
				// TODO: Write AI
			}
		});
	}
);