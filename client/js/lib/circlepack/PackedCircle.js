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

	var PackedCircle = function(view, radius)
	{
		// Data
		this.view = view;

		// Where we would like to be
		this.targetPosition = new Vector(0,0);
		// Where we really are
		this.position = new Vector(0,0);
		this.previousPosition = new Vector(0,0);

		// For the div stuff  - to avoid superflous movement calls
	  	this.positionWithOffset = new Vector(0,0);

		// Stored because transform3D is relative
		this.originalDivPosition = undefined;  // set by someone who created us
		this.setRadius(radius);

		this.collisionBitfield = 0;
	};

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

	PackedCircle.prototype.toString = function()
	{
		return '[PackedCircle(' + this.position.x + ', ' + this.position.y + ') Radius:' + this.radius + ']';
	};

	return PackedCircle;
};

if(typeof window === 'undefined') {
	require('../jsclass/core.js');
	require('../Vector.js');
	PackedCircle = init(Vector);
} else {
	define(['lib/Vector', 'lib/jsclass/core'], init);
}