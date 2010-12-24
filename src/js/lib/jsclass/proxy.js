JS.Proxy = new JS.Module('Proxy', {
  extend: {
    Virtual: new JS.Class({
      initialize: function(klass) {
        var bridge     = function() {},
            proxy      = new JS.Class(),
            delegators = {},
            method, func;
        
        bridge.prototype = klass.prototype;
        
        for (method in klass.prototype) {
          func = klass.prototype[method];
          if (JS.isFn(func) && func !== klass) func = this.klass.forward(method);
          delegators[method] = func;
        }
        
        proxy.include({
          initialize: function() {
            var args    = arguments,
                subject = null;
            
            this.__getSubject__ = function() {
              subject = new bridge;
              klass.apply(subject, args);
              return (this.__getSubject__ = function() { return subject; })();
            };
          },
          klass: klass,
          constructor: klass
        }, false);
        
        proxy.include(new JS.Module(delegators), false);
        proxy.include(this.klass.InstanceMethods, true);
        return proxy;
      },
      
      extend: {
        forward: function(name) {
          return function() {
            var subject = this.__getSubject__();
            return subject[name].apply(subject, arguments);
          };
        },
        
        InstanceMethods: new JS.Module({
          extend: function(source) {
            this.__getSubject__().extend(source);
            var method, func;
            for (method in source) {
              func = source[method];
              if (JS.isFn(func)) func = JS.Proxy.Virtual.forward(method);
              this[method] = func;
            }
          }
        })
      }
    })
  }
});