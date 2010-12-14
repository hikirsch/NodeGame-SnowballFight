/**
File:
	Character Controller.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
 	Base Class for GameEntities

 	A lot of what im trying here comes from this:
	Valve Source SDK Network Entities
 	http://developer.valvesoftware.com/wiki/Networking_Entities

Basic Usage:
		var newCharacter = new CharacterController(aClientID, this.fieldRect);

		// Is this the users character?
		if(messageData.id == this.netChannel.clientID)
		{
			this.clientCharacter = newCharacter;
			this.joystick = new Joystick();
			console.log("(ClientGameController)", this.joystick);
		}

		// Grab the view from the character and add it to our GameView
		this.view.addCharacter(newCharacter.initView());
*/

var init = function(Vector, Rectangle, FieldController, SortedLookupTable, EntityView)
{
	return new JS.Class(
	{
		/**
		 * Initialize a GameEntity with an objectID, and tie it a client
		 * @param {String|Number} anObjectID An unique objectID as supplied by the game controller
		 * @param {String|Number} aClientID	The connection which spawned this object. "0" means it belongs to the game
		 * @param {FieldController} aFieldController	A FieldController instance this object belongs to.
		 */
		initialize: function(anObjectID, aClientID, anEntityModel, aFieldController)
		{
			// Meta information
			this.fieldController = aFieldController;
			this.entityType = GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.UNKNOWN;			// Type
			this.theme = 'NO';
			this.setModel( anEntityModel );

			/**
			 * Connection Properties
			 */
			this.clientID = aClientID;					// Client who created this object, 0 means it has no owner or the owner is the server
			this.objectID = anObjectID;					// Everytime the server creates an object it assigns this number to it

			/**
			 * Movement properties
			 */
			this.velocity = new Vector( 0, 0 );			// Current velocity
			this.maxVelocity = 3.5;   					// Fastest velocity this object will travel at
			this.damping = 1;							// 1.0 means never lose speed over time

			// (Acceleration is applied to velocity)
			this.acceleration = new Vector( 0, 0 );		// All combined forced. reset every tick
			this.moveSpeed = 0;    						// Apply to acceleration if keys pressed.

			// Location
			this.position = new Vector(0, 0);
			this.rotation = 0;
			/**
			 * Collision
			 */
			this.collisionCircle = null; 			// Thing that represents us in collisions
			this.collisionOffset = anEntityModel.collisionOffset || new Vector(0,0); // Offset of our circle from where we are
            this.useTransform = anEntityModel.useTransform || false;
			this.collisionMask = 0; 				// Group we want to collide against
			this.collisionGroup = 0;				// Group we are in
			this.radius = 10;

			this.traits = new SortedLookupTable();
		},

		/**
		 * Creates the 'View' for this character
		 * This should only be called client side.
		 * Will throw an error if the field controller does not contain a view
		 */
		createView: function()
		{
			// if our game has a view, then create one
			if( this.fieldController.hasView() ) {
				this.view = new EntityView(this, this.model );
			}
		},

		/**
		 * Creates the event-listener function for handling collisions
		 * Note: This only is called on the server side
		 * @param aPackedCircle A PackedCircle which is tied to (and represents in the collision system) this entity
		 */
		setCollisionCircleProperties: function(aPackedCircle)
		{
			this.collisionCircle = aPackedCircle;
			this.collisionCircle.view = this;
			// Collision
			this.collisionCircle.collisionMask = this.collisionMask;	// Who we want to collide against
			this.collisionCircle.collisionGroup = this.collisionGroup;	// Which group we are in
			// Position
			this.collisionCircle.position = this.position.cp();		//
			this.collisionCircle.offset = new Vector(this.collisionOffset.x, this.collisionOffset.y);
			// Radius
			this.collisionCircle.setRadius(this.radius);
		},

		/**
		 * Called by the CollisionCircle if it has an event emitter
		 * @param aPackedCircle
		 */
		setupCollisionEvents: function(aPackedCircle)
		{
			aPackedCircle.eventEmitter.on("collision", this.onCollision);
		},

		/**
		 * Based on the velocity that we're going at, we calculate the angle that we should be currently pointing at since
		 * we calculate our X and Y velocities separately.
		 */
		calculateRotation: function()
		{
			var combinedVelocity = this.velocity.x + this.velocity.y;
			// no change
			if(combinedVelocity > -0.1 && combinedVelocity < 0.1) return;
			this.rotation = Math.atan2(this.velocity.y, this.velocity.x);
		},


		/**
		 * Called when a collision has occurred, subclasses should override this method.
		 * @param {PackedCircle} ourCircle The circle that represents this GameEntity in the collision
		 * @param {PackedCircle} otherCircle The circle that represents the GameEntity we collided with
		 * @param {Number} collisionInverseNormal Inverse collision normal, in which [x:cos(collisionInverseNormal) * radius, y:sin(collisionInverseNormal) * radius] is where we collided
		 */
		onCollision: function(ourCircle, otherCircle, collisionInverseNormal)
		{
			console.ourLog('Collision');
//			otherCircle.view.position.mul(0);
		},

		/**
		 * Update, use delta to create frame independent motion
		 * @param speedFactor	A normalized value our ACTUAL framerate vs our desired framerate. 1.0 means exactly correct, 0.5 means we're running at half speed
		 * @param gameClock		The current gameclock
		 */
		tick: function(speedFactor, gameClock)
		{
			if(this.view)
			{
				this.view.update();
			}
			else
			{
				this.updatePosition(speedFactor);
			}
		},

		/**
		 * Updates the position of this gameentity based on it's movement properties (velocity, acceleration, damping)
		 * @param speedFactor Float for considering framerate speedFactor, 1.0 means perfectly accurate.
		 */
		updatePosition: function(speedFactor)
		{
			// Adjust to speedFactor
			this.acceleration.mul(speedFactor);

			// Add acceleration to velocity and velocity to the current position
			this.velocity.add(this.acceleration);

			this.position.x += this.velocity.x * speedFactor;
			this.position.y += this.velocity.y * speedFactor;

			// Wrap horizontal
			if(this.position.x > this.fieldController.getWidth()) {
				this.position.x = 0;
			} else if(this.position.x < 0) { // use view width
				this.position.x = this.fieldController.getWidth();
			}

			// Wrap veritical
			if(this.position.y > this.fieldController.getHeight()) {
				this.position.y = 0;
			} else if(this.position.y < 0) {
				this.position.y = this.fieldController.getHeight();
			}

			// Cap velocity
			this.velocity.limit(this.maxVelocity);

			// Apply damping force
			this.velocity.x *= this.damping;
			this.velocity.y *= this.damping;

			this.calculateRotation();
			this.acceleration.x = this.acceleration.y = 0;
		},


		/**
		 * Net
		 */

		/**
		 * Construct an entity description for this object, it is essentually a CSV so you have to know how to read it on the receiving end
		 * @param wantsFullUpdate	If true, certain things that are only sent when changed are always sent
		 */
		constructEntityDescription: function(wantsFullUpdate)
		{
			var returnString = this.objectID;
				returnString += ","+this.clientID;
				returnString += ","+this.entityType;
				returnString += ","+this.theme;
				returnString += ","+Math.round(this.position.x);
				returnString += ","+Math.round(this.position.y);
				returnString += ","+Math.round(this.rotation*57.2957795);

			return returnString;
		},

		deconstructFromEntityDescription: function(anEntityDescription)
		{
			// TODO: This does nothing now, but should be able to parse entity description and set up own properties
//			throw("All GameEntity subclasses must override this method.");
		},

		/**
		 * Trait accesors
		 */

		/**
		 * Adds and attaches a trait (already created), to this entity.
		 * The trait is only attached if we already have one of the same type attached, or don't care (aTrait.canStack = true)
		 * @param {BaseTrait} aTrait A BaseTrait instance
		 * @return {Boolean} Whether the trait was added
		 */
		addTrait: function(aTrait)
		{
			// Check if we already have this trait, if we do - make sure the trait allows stacking
			var existingVersionOfTrait = this.getTraitWithName(aTrait.displayName);
			if(existingVersionOfTrait && !existingVersionOfTrait.canStack) {
				return false;
			}

			//
			this.removeTraitWithName(aTrait.displayName);
			this.traits.setObjectForKey(aTrait, aTrait.displayName);
			aTrait.attach(this);

			return true;
		},

		addTraitAndExecute: function(aTrait)
		{
			var wasAdded = this.addTrait(aTrait);
			if(wasAdded) {
				aTrait.execute();
			};

			return wasAdded;
		},

		getTraitWithName: function(aTraitName)
		{
			return this.traits.objectForKey(aTraitName)
		},

		removeTraitWithName: function(aTraitName)
		{
			var aTrait = this.traits.objectForKey(aTraitName);
			if(!aTrait) return;

			aTrait.detach();
			this.traits.remove(aTraitName);
		},

		/**
		 * Accessors
		 */

		/**
		 * Sets the nickname of a particular client, should contain a view already
		 * @param {String} aNickName
		 */
		setNickName: function( aNickName )
		{
			this.nickName = aNickName;

			if(this.view)
				this.view.refresh();
		},

		setModel: function( newModel )
		{
			this.model = newModel;
			this.theme = this.model.theme;
		},

		getRotation: function()
		{
			return this.rotation;
		},

		getPosition: function() {
			return this.position;
		},

		hasView: function()
		{
			return this.view != null;
		},

		getView: function()
		{
			if( ! this.view )
			{
				this.createView();
			}

			return this.view;
		},

		/**
		 * Deallocation
		 */
		dealloc: function()
		{
			delete this.position;
			delete this.velocity;
			delete this.acceleration;

			this.traits.dealloc();
			delete this.traits;

			this.fieldController = null;
		}
	});
};

if (typeof window === 'undefined') {
	// We're in node!
	require('js/lib/Vector');
	require('js/lib/Rectangle');
	require('js/controllers/FieldController');
	require('js/lib/SortedLookupTable');
	require('js/lib/jsclass/core.js');


	GameEntity = init(Vector, Rectangle, FieldController, SortedLookupTable, null);
} else {
	// We're on the browser.
	// Require.js will use this file's name (CharacterController.js), to create a new
	define(['lib/Vector', 'lib/Rectangle', 'controllers/FieldController', 'lib/SortedLookupTable', 'view/EntityView', 'lib/jsclass/core'], init);
}