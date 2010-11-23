JS.Enumerable = new JS.Module('Enumerable', {
  extend: {
    forEach: function(block, context) {
      if (!block) return new JS.Enumerator(this, 'forEach');
      for (var i = 0, n = this.length; i < n; i++) {
        if (this[i] !== undefined)
          block.call(context || null, this[i]);
      }
      return this;
    },
    
    isComparable: function(list) {
      return list.all(function(item) { return JS.isFn(item.compareTo) });
    },
    
    areEqual: function(one, another) {
      return one.equals
          ? one.equals(another)
          : (one === another);
    },
    
    Collection: new JS.Class({
      initialize: function(array) {
        this.length = 0;
        var push = Array.prototype.push;
        JS.Enumerable.forEach.call(array, function(item) {
          push.call(this, item);
        }, this);
      }
    })
  },
  
  all: function(block, context) {
    block = JS.Enumerable.toFn(block);
    var truth = true;
    this.forEach(function(item) {
      truth = truth && (block ? block.apply(context || null, arguments) : item);
    });
    return !!truth;
  },
  
  any: function(block, context) {
    block = JS.Enumerable.toFn(block);
    var truth = false;
    this.forEach(function(item) {
      truth = truth || (block ? block.apply(context || null, arguments) : item);
    });
    return !!truth;
  },
  
  count: function(block, context) {
    if (JS.isFn(this.size)) return this.size();
    var count = 0, object = block;
    
    if (block && !JS.isFn(block))
      block = function(x) { return JS.Enumerable.areEqual(x, object) };
    
    this.forEach(function() {
      if (!block || block.apply(context || null, arguments))
        count += 1;
    });
    return count;
  },
  
  cycle: function(n, block, context) {
    if (!block) return this.enumFor('cycle', n);
    block = JS.Enumerable.toFn(block);
    while (n--) this.forEach(block, context);
  },
  
  drop: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i >= n) entries.push(item);
    });
    return entries;
  },
  
  dropWhile: function(block, context) {
    if (!block) return this.enumFor('dropWhile');
    block = JS.Enumerable.toFn(block);
    
    var entries = [],
        drop    = true;
    
    this.forEach(function(item) {
      if (drop) drop = drop && block.apply(context || null, arguments);
      if (!drop) entries.push(item);
    });
    return entries;
  },
  
  forEachCons: function(n, block, context) {
    if (!block) return this.enumFor('forEachCons', n);
    block = JS.Enumerable.toFn(block);
    
    var entries = this.toArray(),
        size    = entries.length,
        limit   = size - n,
        i;
    
    for (i = 0; i <= limit; i++)
      block.call(context || null, entries.slice(i, i+n));
    
    return this;
  },
  
  forEachSlice: function(n, block, context) {
    if (!block) return this.enumFor('forEachSlice', n);
    block = JS.Enumerable.toFn(block);
    
    var entries = this.toArray(),
        size    = entries.length,
        m       = Math.ceil(size/n),
        i;
    
    for (i = 0; i < m; i++)
      block.call(context || null, entries.slice(i*n, (i+1)*n));
    
    return this;
  },
  
  forEachWithIndex: function(offset, block, context) {
    if (JS.isFn(offset)) {
      context = block;
      block   = offset;
      offset  = 0;
    }
    offset = offset || 0;
    
    if (!block) return this.enumFor('forEachWithIndex', offset);
    block = JS.Enumerable.toFn(block);
    
    return this.forEach(function(item) {
      var result = block.call(context || null, item, offset);
      offset += 1;
      return result;
    });
  },
  
  forEachWithObject: function(object, block, context) {
    if (!block) return this.enumFor('forEachWithObject', object);
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function() {
      var args = [object].concat(JS.array(arguments));
      block.apply(context || null, args);
    });
    return object;
  },
  
  find: function(block, context) {
    if (!block) return this.enumFor('find');
    block = JS.Enumerable.toFn(block);
    
    var needle = {}, K = needle;
    this.forEach(function(item) {
      if (needle !== K) return;
      needle = block.apply(context || null, arguments) ? item : needle;
    });
    return needle === K ? null : needle;
  },
  
  findIndex: function(needle, context) {
    if (needle === undefined) return this.enumFor('findIndex');
    
    var index = null,
        block = JS.isFn(needle);
    
    this.forEachWithIndex(function(item, i) {
      if (index !== null) return;
      if (JS.Enumerable.areEqual(needle, item) || (block && needle.apply(context || null, arguments)))
        index = i;
    });
    return index;
  },
  
  first: function(n) {
    var entries = this.toArray();
    return (n === undefined) ? entries[0] : entries.slice(0,n);
  },
  
  grep: function(pattern, block, context) {
    block = JS.Enumerable.toFn(block);
    var results = [];
    this.forEach(function(item) {
      var match = JS.isFn(pattern.match) ? pattern.match(item) : pattern(item);
      if (!match) return;
      if (block) item = block.apply(context || null, arguments);
      results.push(item);
    });
    return results;
  },
  
  groupBy: function(block, context) {
    if (!block) return this.enumFor('groupBy');
    block = JS.Enumerable.toFn(block);
    
    var hash = new JS.Hash();
    this.forEach(function(item) {
      var value = block.apply(context || null, arguments);
      if (!hash.hasKey(value)) hash.store(value, []);
      hash.get(value).push(item);
    });
    return hash;
  },
  
  inject: function(memo, block, context) {
    var args    = JS.array(arguments),
        counter = 0,
        K       = {};
    
    switch (args.length) {
      case 1:   memo      = K;
                block     = args[0];
                break;
      
      case 2:   if (JS.isFn(memo)) {
                  memo    = K;
                  block   = args[0];
                  context = args[1];
                }
    }
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(item) {
      if (!counter++ && memo === K) return memo = item;
      var args = [memo].concat(JS.array(arguments));
      memo = block.apply(context || null, args);
    });
    return memo;
  },
  
  map: function(block, context) {
    if (!block) return this.enumFor('map');
    block = JS.Enumerable.toFn(block);
    
    var map = [];
    this.forEach(function() {
      map.push(block.apply(context || null, arguments));
    });
    return map;
  },
  
  max: function(block, context) {
    return this.minmax(block, context)[1];
  },
  
  maxBy: function(block, context) {
    if (!block) return this.enumFor('maxBy');
    return this.minmaxBy(block, context)[1];
  },
  
  member: function(needle) {
    return this.any(function(item) { return JS.Enumerable.areEqual(item, needle) });
  },
  
  min: function(block, context) {
    return this.minmax(block, context)[0];
  },
  
  minBy: function(block, context) {
    if (!block) return this.enumFor('minBy');
    return this.minmaxBy(block, context)[0];
  },
  
  minmax: function(block, context) {
    var list = this.sort(block, context);
    return [list[0], list[list.length - 1]];
  },
  
  minmaxBy: function(block, context) {
    if (!block) return this.enumFor('minmaxBy');
    var list = this.sortBy(block, context);
    return [list[0], list[list.length - 1]];
  },
  
  none: function(block, context) {
    return !this.any(block, context);
  },
  
  one: function(block, context) {
    block = JS.Enumerable.toFn(block);
    var count = 0;
    this.forEach(function(item) {
      if (block ? block.apply(context || null, arguments) : item) count += 1;
    });
    return count === 1;
  },
  
  partition: function(block, context) {
    if (!block) return this.enumFor('partition');
    block = JS.Enumerable.toFn(block);
    
    var ayes = [], noes = [];
    this.forEach(function(item) {
      (block.apply(context || null, arguments) ? ayes : noes).push(item);
    });
    return [ayes, noes];
  },
  
  reject: function(block, context) {
    if (!block) return this.enumFor('reject');
    block = JS.Enumerable.toFn(block);
    
    var map = [];
    this.forEach(function(item) {
      if (!block.apply(context || null, arguments)) map.push(item);
    });
    return map;
  },
  
  reverseForEach: function(block, context) {
    if (!block) return this.enumFor('reverseForEach');
    block = JS.Enumerable.toFn(block);
    
    var entries = this.toArray(),
        n       = entries.length;
    
    while (n--) block.call(context || null, entries[n]);
    return this;
  },
  
  select: function(block, context) {
    if (!block) return this.enumFor('select');
    block = JS.Enumerable.toFn(block);
    
    var map = [];
    this.forEach(function(item) {
      if (block.apply(context || null, arguments)) map.push(item);
    });
    return map;
  },
  
  sort: function(block, context) {
    var comparable = JS.Enumerable.isComparable(this),
        entries    = this.toArray();
    
    block = block || (comparable
        ? function(a,b) { return a.compareTo(b); }
        : null);
    return block
        ? entries.sort(function(a,b) { return block.call(context || null, a, b); })
        : entries.sort();
  },
  
  sortBy: function(block, context) {
    if (!block) return this.enumFor('sortBy');
    block = JS.Enumerable.toFn(block);
    
    var util       = JS.Enumerable,
        map        = new util.Collection(this.map(block, context)),
        comparable = util.isComparable(map);
    
    return new util.Collection(map.zip(this).sort(function(a, b) {
      a = a[0]; b = b[0];
      return comparable ? a.compareTo(b) : (a < b ? -1 : (a > b ? 1 : 0));
    })).map(function(item) { return item[1]; });
  },
  
  take: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i < n) entries.push(item);
    });
    return entries;
  },
  
  takeWhile: function(block, context) {
    if (!block) return this.enumFor('takeWhile');
    block = JS.Enumerable.toFn(block);
    
    var entries = [],
        take    = true;
    this.forEach(function(item) {
      if (take) take = take && block.apply(context || null, arguments);
      if (take) entries.push(item);
    });
    return entries;
  },
  
  toArray: function() {
    return this.drop(0);
  },
  
  zip: function() {
    var util    = JS.Enumerable,
        args    = [],
        counter = 0,
        n       = arguments.length,
        block, context;
    
    if (JS.isFn(arguments[n-1])) {
      block = arguments[n-1]; context = {};
    }
    if (JS.isFn(arguments[n-2])) {
      block = arguments[n-2]; context = arguments[n-1];
    }
    util.forEach.call(arguments, function(arg) {
      if (arg === block || arg === context) return;
      if (arg.toArray) arg = arg.toArray();
      if (JS.isType(arg, Array)) args.push(arg);
    });
    var results = this.map(function(item) {
      var zip = [item];
      util.forEach.call(args, function(arg) {
        zip.push(arg[counter] === undefined ? null : arg[counter]);
      });
      return ++counter && zip;
    });
    if (!block) return results;
    util.forEach.call(results, block, context);
  }
});
  
// http://developer.mozilla.org/en/docs/index.php?title=Core_JavaScript_1.5_Reference:Global_Objects:Array&oldid=58326
JS.Enumerable.include({
  forEach:    JS.Enumerable.forEach,
  collect:    JS.Enumerable.instanceMethod('map'),
  detect:     JS.Enumerable.instanceMethod('find'),
  entries:    JS.Enumerable.instanceMethod('toArray'),
  every:      JS.Enumerable.instanceMethod('all'),
  findAll:    JS.Enumerable.instanceMethod('select'),
  filter:     JS.Enumerable.instanceMethod('select'),
  some:       JS.Enumerable.instanceMethod('any'),
  
  extend: {
    toFn: function(object) {
      if (!object) return object;
      if (object.toFunction) return object.toFunction();
      if (this.OPS[object]) return this.OPS[object];
      if (JS.isType(object, 'string') || JS.isType(object, String))
        return function() {
          var args   = JS.array(arguments),
              target = args.shift(),
              method = target[object];
          return JS.isFn(method) ? method.apply(target, args) : method;
        };
      return object;
    },
    
    OPS: {
      '+':    function(a,b) { return a + b },
      '-':    function(a,b) { return a - b },
      '*':    function(a,b) { return a * b },
      '/':    function(a,b) { return a / b },
      '%':    function(a,b) { return a % b },
      '^':    function(a,b) { return a ^ b },
      '&':    function(a,b) { return a & b },
      '&&':   function(a,b) { return a && b },
      '|':    function(a,b) { return a | b },
      '||':   function(a,b) { return a || b },
      '==':   function(a,b) { return a == b },
      '!=':   function(a,b) { return a != b },
      '>':    function(a,b) { return a > b },
      '>=':   function(a,b) { return a >= b },
      '<':    function(a,b) { return a < b },
      '<=':   function(a,b) { return a <= b },
      '===':  function(a,b) { return a === b },
      '!==':  function(a,b) { return a !== b },
      '[]':   function(a,b) { return a[b] },
      '()':   function(a,b) { return a(b) }
    },
    
    Enumerator: new JS.Class({
      include: JS.Enumerable,
      
      extend: {
        DEFAULT_METHOD: 'forEach'
      },
      
      initialize: function(object, method, args) {
        this._object = object;
        this._method = method || this.klass.DEFAULT_METHOD;
        this._args   = (args || []).slice();
      },
      
      forEach: function(block, context) {
        if (!block) return this;
        var args = this._args.slice();
        args.push(block);
        if (context) args.push(context);
        return this._object[this._method].apply(this._object, args);
      },
      
      cons:       JS.Enumerable.instanceMethod('forEachCons'),
      reverse:    JS.Enumerable.instanceMethod('reverseForEach'),
      slice:      JS.Enumerable.instanceMethod('forEachSlice'),
      withIndex:  JS.Enumerable.instanceMethod('forEachWithIndex'),
      withObject: JS.Enumerable.instanceMethod('forEachWithObject')
    })
  }
}, false);

JS.Enumerable.Collection.include(JS.Enumerable, true);

JS.Kernel.include({
  enumFor: function(method) {
    var args   = JS.array(arguments),
        method = args.shift();
    return new JS.Enumerable.Enumerator(this, method, args);
  }
}, false);

JS.Kernel.define('toEnum', JS.Kernel.instanceMethod('enumFor'), true);