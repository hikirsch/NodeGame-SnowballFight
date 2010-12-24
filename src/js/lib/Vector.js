/*  
        ####  #####  ##### ####    ###  #   # ###### ###### ##     ##  #####  #     #      ########    ##    #  #  ##### 
       #   # #   #  ###   #   #  #####  ###    ##     ##   ##  #  ##    #    #     #     #   ##   #  #####  ###   ###
       ###  #   #  ##### ####   #   #   #   ######   ##   #########  #####  ##### ##### #   ##   #  #   #  #   # #####
       --
       Mario Gonzalez
*/

define(function(){
	return new JS.Class(
	{
		initialize: function(x, y)
		{
//			debugger;
//			console.log(x,y);
		    if (typeof x == 'Object') {
		        this.x = x.x;
		        this.y = x.y;
		    } else {
		        this.x = x;
		        this.y = y;
		    }
		},

		cp: function()
		{
			return new Vector(this.x, this.y);
		},

		mul: function(factor)
		{
			this.x *= factor;
			this.y *= factor;
			return this;
		},

		mulNew: function(factor)
		{
			return new Vector(this.x * factor, this.y * factor);
		},

		add: function(vec)
		{

		    this.x += vec.x;
		    this.y += vec.y;
		    return this;

		},

		addXY: function(argX, argY)
		{
		    this.x += argX;
		    this.y += argY;
		    return this;
		},

		addNew: function(vec)
		{
			return new Vector(this.x + vec.x, this.y + vec.y);
		},

		sub: function(vec)
		{
			this.x -= vec.x;
			this.y -= vec.y;
			return this;
		},

		subNew: function(vec)
		{
			return new Vector(this.x - vec.x, this.y - vec.y);
		},

		// angle in radians
		rotate: function(angle)
		{
			var x = this.x, y = this.y;
			this.x = x * Math.cos(angle) - Math.sin(angle) * y;
			this.y = x * Math.sin(angle) + Math.cos(angle) * y;
			return this;
		},

		// angle still in radians
		rotateNew: function(angle)
		{
			return this.cp().rotate(angle);
		},

		set: function(newX, newY)
		{
			this.x = newX, this.y = newY;
		},

		// RADIANS
		setAngle: function(angle)
		{
			var l = this.length();
			this.x = Math.cos(angle) * l;
			this.y = Math.sin(angle) * l;
			return this;
		},

		// RADIANS
		setAngleNew: function(angle)
		{
			return this.cp().setAngle(angle);
		},

		setLength: function(length)
		{
			var l = this.length();
			if ( l ) this.mul(length / l);
			else this.x = this.y = length;
			return this;
		},

		setLengthNew: function(length)
		{
			return this.cp().setLength(length);
		},

		normalize: function()
		{
		    var l = this.length();
		    this.x /= l;
		    this.y /= l;
		    return this;

		},

		normalizeNew: function()
		{
			return this.cp().normalize();
		},

		angle: function()
		{
			return Math.atan2(this.y, this.x);
		},

		collidesWith: function(rect)
		{
			return this.x > rect.x && this.y > rect.y && this.x < rect.x + rect.width && this.y < rect.y + rect.height;
		},

		limit: function(max)
		{
			var aLenthSquared = this.lengthSquared();
			// Check against max speed, avoid premature sqrt call - also avoid division by zero
			if(aLenthSquared+0.01 > max*max)
			{
				var aLength = Math.sqrt(aLenthSquared);
				this.x = (this.x/aLength) * max;
				this.y = (this.y/aLength) * max;
			}
		},

		length: function()
		{
		    var length = Math.sqrt(this.x * this.x + this.y * this.y);
		    if ( length < 0.005 && length > -0.005) return 0.000001;
		    return length;
		},

		lengthSquared: function()
		{
		    var lengthSquared = this.x * this.x + this.y * this.y;

		    if ( lengthSquared < 0.005 && lengthSquared > -0.005) return 0;
		    return lengthSquared;
		},


		distance: function(vec)
		{
			var deltaX = this.x - vec.x;
			var deltaY = this.y - vec.y;
			return Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
		},

		distanceSquared: function(vec)
		{
			var deltaX = this.x - vec.x;
			var deltaY = this.y - vec.y;
			return (deltaX * deltaX) + (deltaY * deltaY);
		},

		is: function(test)
		{
			return typeof test == 'object' && this.x == test.x && this.y == test.y;
		},

		toString: function()
		{
			return '[Vector] x:' + this.truncateAndReturnString(this.x) + " y:" + this.truncateAndReturnString(this.y);
//			return '[Vector(' + this.x + ', ' + this.y + ') angle: ' + this.angle() + ', length: ' + this.length() + ']';
		},
		

		truncateAndReturnString: function(aValue)
		{
			 return String(Math.round(Math.floor(aValue*10))/10)
		}
	});
});