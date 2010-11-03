(function(){
	
	// some defaults we use
	this.velocity = { x: 0, y: 0 }; // how fast i am going
	this.acceleration = { x: .1, y: .1 }; // how much i accelerate per tick
	this.damping = { x: .033, y: .033 }; // how much of a slide there is, how much do i take away per frame if there's no positive movement
	this.maxVelocity = { x: 2.5, y: 2.5 };  // the fastest i can go
	this.rotation = 0; // we start pointing up, simply easy b/c of sprites right now
	this.aClientID = -1;
	
	var CharacterController = this.CharacterController =  function(aClientID) {
		this.clientID = aClientID;
		console.log('Character Created!');
	};
	
	CharacterController.prototype.doSomething = function() {
		console.log('(Testclass) doSomething()!');
		return 'hi';
	}
	
	return CharacterController;
})();