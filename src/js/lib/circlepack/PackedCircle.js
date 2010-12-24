/**
	  ####  #####  ##### ####    ###  #   # ###### ###### ##     ##  #####  #     #      ########    ##    #  #  #####
	 #   # #   #  ###   #   #  #####  ###    ##     ##   ##  #  ##    #    #     #     #   ##   #  #####  ###   ###
	 ###  #   #  ##### ####   #   #   #   ######   ##   #########  #####  ##### ##### #   ##   #  #   #  #   # #####
 -
 File:
 	PackedCircle.js
 Created By:
 	Mario Gonzalez
 Project	:
 	None
 Abstract:
 		 A single packed circle.
	 Contains a reference to it's div, and information pertaining to it state.
 Basic Usage:
	http://onedayitwillmake.com/CirclePackJS/
*/
var init = function(Vector)
{

	var PackedCircle = function(radius)
	{
		// Data
		this.view = null;

		// Where we would like to be
		this.targetPosition = new Vector(0,0);
		// Where we really are
		this.position = new Vector(0,0);
		this.offset = new Vector(0,0);
		this.previousPosition = new Vector(0,0);

		this.setRadius(radius);

		this.isFixed = false; // If fixed it can collide with something but is never moved!
		this.collisionMask = 0;
		this.collisionGroup = 0;
		this.eventEmitter = null;
	};

	PackedCircle.prototype.createEventEmitter = function ()
	{
		this.eventEmitter = new EVENTS.EventEmitter();

		if(this.view) {
			this.view.setupCollisionEvents(this);
		}

		// Comment if needed, Node.js creates a array of listeners if more than one is detected. Avoid the array
//		this.eventEmitter.addListener("newListener", function (event, listener)
//		{
//			// In case we care about when a new listener is added
//		});

	},

	PackedCircle.prototype.setPosition = function(aPosition)
	{
		this.previousPosition = this.position;
		this.position = aPosition.cp();
	};

	PackedCircle.prototype.containsPoint = function(aPoint)
	{
		var distanceSquared = this.position.distanceSquared(aPoint);
		// if it's shorter than either radi, we intersect
		return distanceSquared < this.radiusSquared;
	};

	PackedCircle.prototype.distanceSquaredFromTargetPosition = function()
	{
		var distanceSquared = this.position.distanceSquared(this.targetPosition);
		// if it's shorter than either radi, we intersect
		return distanceSquared < this.radiusSquared;
	};

	PackedCircle.prototype.intersects = function(aCircle)
	{
		var distanceSquared = this.position.distanceSquared(aCircle.position);
		// if it's shorter than either radi, we intersect
		return (distanceSquared < this.radiusSquared || distanceSquared < aCircle.radiusSquared);
	};

	PackedCircle.prototype.setRadius = function(aRadius)
	{
		// Size
		this.radius = aRadius;
		this.radiusSquared = aRadius * aRadius;
		this.originalRadius = aRadius;
	};

	/**
	 * Memory Management
	 */
	PackedCircle.prototype.dealloc = function ()
	{
		if(this.eventEmitter) {
			this.eventEmitter.removeAllListeners('newListener');
			this.eventEmitter.removeAllListeners('collision');

			delete this.eventEmitter;
			this.eventEmitter = null;
		}

		// Destroy Vectors
		delete this.targetPosition, this.targetPosition = null;
		delete this.position, this.targetPosition = null;
		delete this.previousPosition, this.targetPosition = null;

		this.view = null;
	},
			
	/**
	 * Accessors
	 */
	PackedCircle.prototype.toString = function()
	{
		return '[PackedCircle(' + this.position.x + ', ' + this.position.y + ') Radius:' + this.radius + ']';
	};

	return PackedCircle;
};

if(typeof window === 'undefined') {
	require('../jsclass/core.js');
	require('../Vector.js');
	EVENTS = require('events');
	
	//if(typeof window === 'undefined') {
	PackedCircle = init(Vector);
} else {
	define(['lib/Vector'], init);
}