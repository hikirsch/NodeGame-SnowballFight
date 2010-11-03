(function(){
	var Testclass = this.Testclass =  function() {
	};
	
	Testclass.prototype.doSomething = function() {
		console.log('(Testclass) doSomething()!');
		return 'hi';
	}
	
	return Testclass;
})();

/*
(function () { 
	console.log('ab');
    var my = {}, 
        privateVariable = 1; 
     
    function privateMethod() { 
        // ... 
    } 
     
    my.moduleProperty = 1; 
    my.moduleMethod = function () { 
        // ... 
    }; 
     
    return my; 
}());
*/