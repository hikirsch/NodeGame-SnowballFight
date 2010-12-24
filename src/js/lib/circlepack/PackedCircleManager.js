/**
	  ####  #####  ##### ####    ###  #   # ###### ###### ##     ##  #####  #     #      ########    ##    #  #  #####
	 #   # #   #  ###   #   #  #####  ###    ##     ##   ##  #  ##    #    #     #     #   ##   #  #####  ###   ###
	 ###  #   #  ##### ####   #   #   #   ######   ##   #########  #####  ##### ##### #   ##   #  #   #  #   # #####
 �
 File:
 	PackedCircleManager.js
 Created By:
 	Mario Gonzalez
 Project	:
 	None
 Abstract:
 	Manages a set of packed circles.
 Basic Usage:
	http://onedayitwillmake.com/CirclePackJS/
*/
define( [ 'events', 'lib/Vector', 'lib/circlepack/PackedCircle' ], function( EVENTS, Vector, PackedCircle ) {
	/*
	 *	PackedCircleManager
	 */
	var PackedCircleManager = function( options )
	{

		//allCircles
		this.allCircles = [];
		this.desiredTarget = new Vector(0,0);
		this.bounds = {left:0, top:0, right:0, bottom:0};
		this.boundsRule = options.boundsRule || 0;

		// Number of passes for the centering and collision algorithms - it's (O)logN^2 so use increase at your own risk!
		// Play with these numbers - see what works best for your project
		this.numberOfCollisionPasses = options.collisionPasses || 5;  // More passes looks better but is slower
		this.numberOfCenteringPasses = options.centeringPasses || 0;   // More passes gets to target position faster, A value of 1 works well

		// Uses Node.js event system, not compatible in browser!
		this.dispatchCollisionEvents = options.dispatchCollisionEvents || false;
		this.eventEmitter = null;

		if(this.dispatchCollisionEvents) {
			this.createEventEmitter();
		}
	};

	/**
	 * Create the event emitter.
	 * Note: This only works in Node.js
	 */
	PackedCircleManager.prototype.createEventEmitter = function() {
		this.eventEmitter = new EVENTS.EventEmitter();

		// Comment out only if really need to know when a new listener is added.
		// Node.js creates a array of listeners if more than one is detected. Avoid the array
//		this.eventEmitter.addListener("newListener", function (event, listener)
//		{
//			// In case we care about when a new listener is added
//		});
	};

	/**
	 * Set the boundary rectangle for the circle packing.
	 * This is used to locate the 'center'
	 * @param aBoundaryObject
	 */
	PackedCircleManager.prototype.setBounds = function (aBoundaryObject)
	{
		this.bounds = aBoundaryObject;
		this.desiredTarget = new Vector(aBoundaryObject.right/2, aBoundaryObject.bottom/2);
	};

	/**
	 * Add a circle
	 * @param aCircle A Circle to add, should already be created.
	 */
	PackedCircleManager.prototype.addCircle = function(aCircle, key)
	{
		this.allCircles.push(aCircle);

		aCircle.collisionGroup = aCircle.view.collisionGroup;
		aCircle.collisionMask = aCircle.view.collisionMask;

		if(this.dispatchCollisionEvents)
			aCircle.createEventEmitter();
	};

	/**
	 * Removes a circle
	 * @param aCircle	Circle to remove
	 */
	PackedCircleManager.prototype.removeCircle = function(aCircle)
	{
		var index = 0,
			found = false,
			len = this.allCircles.length;

		if(len === 0) {
			throw "Error: (PackedCircleManager) attempting to remove circle, and allCircles.length === 0!!"
		}

		while (len--) {
			if(this.allCircles[len] === aCircle) {
				found = true;
				index = len;
				break;
			}
		}

		if(!found) {
			throw "Could not locate circle in allCircles array!"
		}

		// Remove
		this.allCircles[index].dealloc();
		this.allCircles[index] = null;
		//this.allCircles.splice(index, 1);
	};


	/**
	 * Forces all circles to move to where their target's position is
	 * Assumes all targets have a 'position' property!
	 */
	PackedCircleManager.prototype.forceCirclesToMatchViewPositions = function()
	{
		var len = this.allCircles.length;
		// push toward target position
		for(var n = 0; n < len; n++)
		{
			var aCircle = this.allCircles[n];
			if(!aCircle || !aCircle.view) {
				continue;
			}

			aCircle.position.x = aCircle.view.position.x + aCircle.offset.x;
			aCircle.position.y = aCircle.view.position.y + aCircle.offset.y;
		}
	};

	/**
	 * A thing
	 * @param aTarget	YEAH!
	 */
	PackedCircleManager.prototype.pushAllCirclesTowardTarget = function(aTarget)
	{
		var v = new Vector(0, 0);

		var dragCircle = this.draggedCircle,
			circleList = this.allCircles,
			len = circleList.length;

//		circleList.sort(this.sortOnDistanceToCenter);

		// push toward target position
		for(var n = 0; n < this.numberOfCenteringPasses; n++)
		{
			var damping = 0.03;
			for(i = 0; i < len; i++)
			{
				var c = circleList[i];

				if(c == dragCircle) continue;

				v.x = c.position.x - aTarget.x;
				v.y = c.position.y - aTarget.y;
				v.mul(damping);

				c.position.x -= v.x;
				c.position.y -= v.y;
			}
		}
	};


	/**
	 * Packs the circles towards the center of the bounds.
	 * Each circle will have it's own 'targetPosition' later on
	 */
	PackedCircleManager.prototype.handleCollisions = function()
	{
		var v = new Vector(0, 0);

		var dragCircle = this.draggedCircle; // ignore for now
		var circleList = this.allCircles;

		// remove null elements
		for (var k = circleList.length; k >= 0; k--) {
			if (circleList[k] === null)
				circleList.splice(k, 1);
		}


		// Collide circles
		var len = circleList.length;
		for(var n = 0; n < this.numberOfCollisionPasses; n++)
		{
			for(var i = 0; i < len; i++)
			{
				var ci = circleList[i];


				for (var j = i + 1; j< len; j++)
				{
					var cj = circleList[j];

					if( !this.circlesShouldCollide(ci, cj) ) continue;   // It's us!


					var dx = cj.position.x - ci.position.x,
						dy = cj.position.y - ci.position.y;

					// The distance between the two circles radii, but we're also gonna pad it a tiny bit
					var r = (ci.radius + cj.radius) * 1.08,
						d = ci.position.distanceSquared(cj.position);

					/**
					 * Collision detected!
					 */
					if (d < (r * r) - 0.02 )
					{
						v.x = dx;
						v.y = dy;
						v.normalize();

						var inverseForce = (r - Math.sqrt(d)) * 0.5;
						v.mul(inverseForce);

						// Move cj opposite of the collision as long as its not fixed
						if(!cj.isFixed)
						{
							if(ci.isFixed) v.mul(2.2);	// Double inverse force to make up for the fact that the other object is fixed

							// ADD the velocity
							(cj.view) ? cj.view.position.add(v) : cj.position.add(v);
						}

						// Move ci opposite of the collision as long as its not fixed
						if(!ci.isFixed)
						{
							if(cj.isFixed) v.mul(2.2);	// Double inverse force to make up for the fact that the other object is fixed

							 // SUBTRACT the velocity
							(ci.view) ? ci.view.position.sub(v) : ci.position.sub(v);
						}

						// Emit the collision event from each circle, with itself as the first parameter
						if(this.dispatchCollisionEvents && n == this.numberOfCollisionPasses-1)
						{
							this.eventEmitter.emit('collision', cj, ci, v);
						}
					}
				}
			}
		}
	};


	PackedCircleManager.prototype.handleBoundaryForCircle = function(aCircle, boundsRule)
	{
		if(aCircle == this.draggedCircle) return; // Ignore if being dragged

		var xpos = aCircle.position.x;
		var ypos = aCircle.position.y;

		var radius = aCircle.radius;
		var diameter = radius*2;

		// Toggle these on and off,
		// Wrap and bounce, are opposite behaviors so pick one or the other for each axis, or bad things will happen.
		var wrapXMask = 1 << 0;
		var wrapYMask = 1 << 2;
		var constrainXMask = 1 << 3;
		var constrainYMask = 1 << 4;
		var emitEvent = 1 << 5;

		// TODO: Promote to member variable
		// Convert to bitmask - Uncomment the one you want, or concact your own :)
//		boundsRule = wrapY; // Wrap only Y axis
//		boundsRule = wrapX; // Wrap only X axis
//		boundsRule = wrapXMask | wrapYMask; // Wrap both X and Y axis
		boundsRule = wrapYMask | constrainXMask;  // Wrap Y axis, but constrain horizontally

//		Wrap X
		if(boundsRule & wrapXMask && xpos-diameter > this.bounds.right) {
			aCircle.position.x = this.bounds.left + radius;
		} else if(boundsRule & wrapXMask && xpos+diameter < this.bounds.left) {
			aCircle.position.x = this.bounds.right - radius;
		}
//		Wrap Y
		if(boundsRule & wrapYMask && ypos-diameter > this.bounds.bottom) {
			aCircle.position.y = this.bounds.top - radius;
		} else if(boundsRule & wrapYMask && ypos+diameter < this.bounds.top) {
			aCircle.position.y = this.bounds.bottom + radius;
		}

//		Constrain X
		if(boundsRule & constrainXMask && xpos+radius >= this.bounds.right) {
			aCircle.position.x = aCircle.position.x = this.bounds.right-radius;
		} else if(boundsRule & constrainXMask && xpos-radius < this.bounds.left) {
			aCircle.position.x = this.bounds.left + radius;
		}

//		  Constrain Y
		if(boundsRule & constrainYMask && ypos+radius > this.bounds.bottom) {
			aCircle.position.y = this.bounds.bottom - radius;
		} else if(boundsRule & constrainYMask && ypos-radius < this.bounds.top) {
			aCircle.position.y = this.bounds.top + radius;
		}
	};

	/**
	 * Place all circles randomly within the boundary
	 */
	PackedCircleManager.prototype.randomizeCirclePositions = function()
	{
		for(var i = 0; i < this.allCircles.length; i++)
		{
			var ci = this.allCircles[i];
			var randomPosition = new Vector(0,0);
			randomPosition.x = this.randRange(this.bounds.left, this.bounds.right);
			randomPosition.y = this.randRange(this.bounds.top, this.bounds.bottom);

			ci.setPosition(randomPosition);
		}
	};

	/**
	 * Force a certain circle to be the 'draggedCircle'.
	 * Can be used to undrag a circle by calling setDraggedCircle(null)
	 * @param aCircle  Circle to start dragging. It's assumed to be part of our list. No checks in place currently.
	 */
	PackedCircleManager.prototype.setDraggedCircle = function(aCircle)
	{
		// Setting to null, and we had a circle before. Restore the radius of the circle as it was previously
		if(this.draggedCircle && this.draggedCircle != aCircle) {
			this.draggedCircle.radius = this.draggedCircle.originalRadius;
		}
		this.draggedCircle = aCircle;
	};


	/**
	 * Sets the target position where the circles want to be
	 * @param aPosition
	 */
	PackedCircleManager.prototype.setTarget = function(aPosition)
	{
		this.desiredTarget = aPosition;
	};

	/**
	 * Given an x,y position finds circle underneath and sets it to the currently grabbed circle
	 * @param xpos
	 * @param ypos
	 * @param buffer	A radiusSquared around the point in question where something is considered to match
	 */
	PackedCircleManager.prototype.getCircleAt = function(xpos, ypos, buffer)
	{
		var circleList = this.allCircles;
		var len = circleList.length;
		var grabVector = new Vector(xpos, ypos);

		// These are set every time a better match i found
		var closestCircle = null;
		var closestDistance = Number.MAX_VALUE;

		// Loop thru and find the closest match
		for(var i = 0; i < len; i++)
		{
			var aCircle = circleList[i];
			if(!aCircle) continue;
			var distanceSquared = aCircle.position.distanceSquared(grabVector);

			if(distanceSquared < closestDistance && distanceSquared < aCircle.radiusSquared + buffer)
			{
				closestDistance = distanceSquared;
				closestCircle = aCircle;
			}
		}

		if(closestCircle === null) return null;


//		this.setDraggedCircle(closestCircle);
//		this.draggedCircle.radius = this.draggedCircle.originalRadius*2;
		return closestCircle;
	};

	/**
	 * Returns the comaprison result for two circles based on their distance from their target location
	 * @param circleA	First Circle
	 * @param circleB
	 */
	PackedCircleManager.prototype.sortOnDistanceToCenter = function(circleA, circleB)
	{
		var valueA = circleA.distanceSquaredFromTargetPosition();
		var valueB = circleB.distanceSquaredFromTargetPosition();
		var comparisonResult = 0;

		if(valueA > valueB) comparisonResult = -1;
		else if(valueA < valueB) comparisonResult = 1;

		return comparisonResult;
	};

	/**
	 * Determins if two circles should collide by comparing tha they are not equal,
	 * and collision bitmask of each determines they want to collide
	 * @param circleA	A circle that wants to collide with circleB
	 * @param circleB 	A circle that wants to collide with circleA
	 */
	PackedCircleManager.prototype.circlesShouldCollide = function(circleA, circleB)
	{
		if(!circleA || !circleB || circleA === circleB) return false; 					// one is null (will be deleted next loop), or both point to same obj.
		if(circleA.view == null || circleB.view == null) return false;					// This circle will be removed next loop, it's entity is already removed

		if(circleA.isFixed & circleB.isFixed) return false;
		if(circleA.view.clientID === circleB.view.clientID) return false; 				// Don't let something collide with stuff it owns

		// They dont want to collide
		if((circleA.collisionGroup & circleB.collisionMask) == 0) return false;
		if((circleB.collisionGroup & circleA.collisionMask) == 0) return false;

		return true;
	},


	/**
	 * Helper functions
	 */
	PackedCircleManager.prototype.randRange = function(min, max)
	{
		return Math.random() * (max-min) + min;
	};

	return PackedCircleManager;
});