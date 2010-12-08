JS.Decorator = new JS.Class('Decorator', {
  initialize: function(decoree, methods) {
	console.log("(DEC) A")
    var decorator  = new JS.Class(),
        delegators = {},
        method, func;
    
    for (method in decoree.prototype) {
      func = decoree.prototype[method];
      if (JS.isFn(func) && func !== decoree) func = this.klass.delegate(method);
      delegators[method] = func;
    }
    
    decorator.include(new JS.Module(delegators), false);
    decorator.include(this.klass.InstanceMethods, false);
    decorator.include(methods, true);
    return decorator;
  },
  
  extend: {

    delegate: function(name) {
		console.log("(DEC) B")
      return function() {
		console.log("(DEC) B2")
        return this.component[name].apply(this.component, arguments);
      };
    },
    
    InstanceMethods: new JS.Module({
      initialize: function(component) {

		  console.log("(DEC) C")
        this.component = component;
        this.klass = this.constructor = component.klass;
        var method, func;
        for (method in component) {
          if (this[method]) continue;
          func = component[method];
          if (JS.isFn(func)) func = JS.Decorator.delegate(method);
          this[method] = func;
        }
      },
      
      extend: function(source) {
		  console.log("(DEC) D")
        this.component.extend(source);
        var method, func;
        for (method in source) {
          func = source[method];
          if (JS.isFn(func)) func = JS.Decorator.delegate(method);
          this[method] = func;
        }
      }
    })
  }
});