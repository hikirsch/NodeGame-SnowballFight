JS.StackTrace = new JS.Module('StackTrace', {
  extend: {
    included: function(base) {
      var module = base.__mod__ || base,
          self   = this,
          method;
      
      module.extend({define: function(name, func) {
        if (!JS.isFn(func)) return this.callSuper();
        var wrapper = self.wrap(func, module, name);
        return this.callSuper(name, wrapper);
      } });
      
      for (method in module.__fns__)
        module.define(method, module.__fns__[method], false);
      module.resolve();
      
      if (!module.__nom__) setTimeout(function() {
        module.__nom__ = self.nameOf(base);
      }, 1);
    },
    
    nameOf: function(object, root) {
      var results = [], i, n, field, l;
      
      if (JS.isType(object, Array)) {
        for (i = 0, n = object.length; i < n; i++)
          results.push(this.nameOf(object[i]));
        return results;
      }
      
      if (object.__nom__) return object.__nom__;
      
      field = [{name: null, o: root || this.root}];
      l = 0;
      while (typeof field === 'object' && l < this.maxDepth) {
        l += 1;
        field = this.descend(field, object);
      }
      if (typeof field == 'string') {
        field = field.replace(/\.prototype\./g, '#');
        object.__nom__ = field;
        if (object.__meta__) object.__meta__.__nom__ = field + '.__meta__';
      }
      return object.__nom__;
    },
    
    descend: function(list, needle) {
      var results = [],
          n       = list.length,
          i       = n,
          key, item, name;
      
      while (i--) {
        item = list[i];
        if (n > 1 && JS.indexOf(this.excluded, item.o) !== -1) continue;
        if (JS.isType(item.o, Array)) continue;
        name = item.name ? item.name + '.' : '';
        for (key in item.o) {
          if (needle && item.o[key] === needle) return name + key;
          results.push({name: name + key, o: item.o[key]});
        }
      }
      return results;
    },
    
    root:       this,
    excluded:   [],
    maxDepth:   8,
    logLevel:   'full',
    
    stack: new JS.Singleton({
      _list: [],
      
      indent: function() {
        var indent = '',
            n      = this._list.length;
        
        while (n--) indent += '|  ';
        return indent;
      },
      
      push: function(name, object, args) {
        if (JS.StackTrace.logLevel === 'full') window.console &&
            console.log(this.indent() + name + '(', args, ')');
        this._list.push({name: name, object: object, args: args});
      },
      
      pop: function(result) {
        var name = this._list.pop().name;
        if (JS.StackTrace.logLevel === 'full') window.console &&
            console.log(this.indent() + name + '() --> ', result);
        return name;
      },
      
      top: function() {
        return this._list[this._list.length - 1] || {};
      },
      
      backtrace: function() {
        var i = this._list.length, item;
        while (i--) {
          item = this._list[i];
          window.console && console.log(item.name, 'in', item.object, '(', item.args, ')');
        }
      }
    }),
    
    flush: function() {
      this.stack._list = [];
    },
    
    print: function() {
      this.stack.backtrace();
    },
    
    wrap: function(func, module, name) {
      var self = JS.StackTrace;
      var wrapper = function() {
        var result, fullName = self.nameOf(module) + '#' + name;
        self.stack.push(fullName, this, arguments);
        
        if (self.logLevel === 'errors') {
          try { result = func.apply(this, arguments); }
          catch (e) {
            if (e.logged) throw e;
            e.logged = true;
            window.console && console.error(e, 'thrown by', self.stack.top().name + '. Backtrace:');
            self.print();
            self.flush();
            throw e;
          }
        } else {
          result = func.apply(this, arguments);
        }
        
        self.stack.pop(result);
        return result;
      };
      wrapper.toString = function() { return func.toString() };
      return wrapper;
    }
  }
});

(function() {
  var module = JS.StackTrace, key;
  for (key in module.root) {
    if (key !== 'JS') module.excluded.push(module.root[key]);
  }
})();