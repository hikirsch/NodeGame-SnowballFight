JS.Hash = new JS.Class('Hash', {
  include: JS.Enumerable || {},
  
  extend: {
    Pair: new JS.Class({
      include: JS.Comparable || {},
      
      setKey: function(key) {
        this[0] = this.key = key;
      },
      
      hasKey: function(key) {
        return JS.Enumerable.areEqual(this.key, key);
      },
      
      setValue: function(value) {
        this[1] = this.value = value;
      },
      
      hasValue: function(value) {
        return JS.Enumerable.areEqual(this.value, value);
      },
      
      compareTo: function(other) {
        return this.key.compareTo
            ? this.key.compareTo(other.key)
            : (this.key < other.key ? -1 : (this.key > other.key ? 1 : 0));
      },
      
      hash: function() {
        var key   = JS.Hash.codeFor(this.key),
            value = JS.Hash.codeFor(this.value);
        
        return [key, value].sort().join('');
      }
    }),
    
    codeFor: function(object) {
      if (typeof object !== 'object') return String(object);
      return JS.isFn(object.hash)
          ? object.hash()
          : object.toString();
    }
  },
  
  initialize: function(object) {
    this.clear();
    if (!JS.isType(object, Array)) return this.setDefault(object);
    for (var i = 0, n = object.length; i < n; i += 2)
      this.store(object[i], object[i+1]);
  },
  
  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = JS.Enumerable.toFn(block);
    
    var hash, bucket, i;
    
    for (hash in this._buckets) {
      if (!this._buckets.hasOwnProperty(hash)) continue;
      bucket = this._buckets[hash];
      i = bucket.length;
      while (i--) block.call(context || null, bucket[i]);
    }
    return this;
  },
  
  _bucketForKey: function(key, createIfAbsent) {
    var hash   = this.klass.codeFor(key),
        bucket = this._buckets[hash];
    
    if (!bucket && createIfAbsent)
      bucket = this._buckets[hash] = [];
    
    return bucket;
  },
  
  _indexInBucket: function(bucket, key) {
    var i     = bucket.length,
        ident = !!this._compareByIdentity;
        
    while (i--) {
      if (ident ? (bucket[i].key === key) : bucket[i].hasKey(key))
        return i;
    }
    return -1;
  },
  
  assoc: function(key, createIfAbsent) {
    var bucket, index, pair;
    
    bucket = this._bucketForKey(key, createIfAbsent);
    if (!bucket) return null;
    
    index = this._indexInBucket(bucket, key);
    if (index > -1) return bucket[index];
    if (!createIfAbsent) return null;
    
    this.size += 1; this.length += 1;
    pair = new this.klass.Pair;
    pair.setKey(key);
    bucket.push(pair);
    return pair;
  },
  
  rassoc: function(value) {
    var key = this.key(value);
    return key ? this.assoc(key) : null;
  },
  
  clear: function() {
    this._buckets = {};
    this.length = this.size = 0;
  },
  
  compareByIdentity: function() {
    this._compareByIdentity = true;
    return this;
  },
  
  comparesByIdentity: function() {
    return !!this._compareByIdentity;
  },
  
  setDefault: function(value) {
    this._default = value;
    return this;
  },
  
  getDefault: function(key) {
    return JS.isFn(this._default)
        ? this._default(this, key)
        : (this._default || null);
  },
  
  equals: function(other) {
    if (!JS.isType(other, JS.Hash) || this.length !== other.length)
      return false;
    var result = true;
    this.forEach(function(pair) {
      if (!result) return;
      var otherPair = other.assoc(pair.key);
      if (otherPair === null || !otherPair.hasValue(pair.value)) result = false;
    });
    return result;
  },
  
  hash: function() {
    var hashes = [];
    this.forEach(function(pair) { hashes.push(pair.hash()) });
    return hashes.sort().join('');
  },
  
  fetch: function(key, defaultValue, context) {
    var pair = this.assoc(key);
    if (pair) return pair.value;
    
    if (defaultValue === undefined) throw new Error('key not found');
    if (JS.isFn(defaultValue)) return defaultValue.call(context || null, key);
    return defaultValue;
  },
  
  forEachKey: function(block, context) {
    if (!block) return this.enumFor('forEachKey');
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(pair) {
      block.call(context || null, pair.key);
    });
    return this;
  },
  
  forEachPair: function(block, context) {
    if (!block) return this.enumFor('forEachPair');
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(pair) {
      block.call(context || null, pair.key, pair.value);
    });
    return this;
  },
  
  forEachValue: function(block, context) {
    if (!block) return this.enumFor('forEachValue');
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(pair) {
      block.call(context || null, pair.value);
    });
    return this;
  },
  
  get: function(key) {
    var pair = this.assoc(key);
    return pair ? pair.value : this.getDefault(key);
  },
  
  hasKey: function(key) {
    return !!this.assoc(key);
  },
  
  hasValue: function(value) {
    var has = false, ident = !!this._compareByIdentity;
    this.forEach(function(pair) {
      if (has) return;
      if (ident ? value === pair.value : JS.Enumerable.areEqual(value, pair.value))
        has = true;
    });
    return has;
  },
  
  invert: function() {
    var hash = new this.klass;
    this.forEach(function(pair) {
      hash.store(pair.value, pair.key);
    });
    return hash;
  },
  
  isEmpty: function() {
    for (var hash in this._buckets) {
      if (this._buckets.hasOwnProperty(hash) && this._buckets[hash].length > 0)
        return false;
    }
    return true;
  },
  
  key: function(value) {
    var result = null;
    this.forEach(function(pair) {
      if (!result && JS.Enumerable.areEqual(value, pair.value))
        result = pair.key;
    });
    return result;
  },
  
  keys: function() {
    var keys = [];
    this.forEach(function(pair) { keys.push(pair.key) });
    return keys;
  },
  
  merge: function(hash, block, context) {
    var newHash = new this.klass;
    newHash.update(this);
    newHash.update(hash, block, context);
    return newHash;
  },
  
  rehash: function() {
    var temp = new this.klass;
    temp._buckets = this._buckets;
    this.clear();
    this.update(temp);
  },
  
  remove: function(key, block) {
    if (block === undefined) block = null;
    var bucket, index, result;
    
    bucket = this._bucketForKey(key);
    if (!bucket) return JS.isFn(block) ? this.fetch(key, block) : this.getDefault(key);
    
    index = this._indexInBucket(bucket, key);
    if (index < 0) return JS.isFn(block) ? this.fetch(key, block) : this.getDefault(key);
    
    result = bucket[index].value;
    bucket.splice(index, 1);
    this.size -= 1;
    this.length -= 1;
    
    if (bucket.length === 0)
      delete this._buckets[this.klass.codeFor(key)];
    
    return result;
  },
  
  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(pair) {
      if (block.call(context || null, pair))
        this.remove(pair.key);
    }, this);
    return this;
  },
  
  replace: function(hash) {
    this.clear();
    this.update(hash);
  },
  
  shift: function() {
    var keys = this.keys();
    if (keys.length === 0) return this.getDefault();
    var pair = this.assoc(keys[0]);
    this.remove(pair.key);
    return pair;
  },
  
  store: function(key, value) {
    this.assoc(key, true).setValue(value);
    return value;
  },
  
  toString: function() {
    return 'Hash:{' + this.map(function(pair) {
      return pair.key.toString() + '=>' + pair.value.toString();
    }).join(',') + '}';
  },
  
  update: function(hash, block, context) {
    var blockGiven = JS.isFn(block);
    hash.forEach(function(pair) {
      var key = pair.key, value = pair.value;
      if (blockGiven && this.hasKey(key))
        value = block.call(context || null, key, this.get(key), value);
      this.store(key, value);
    }, this);
  },
  
  values: function() {
    var values = [];
    this.forEach(function(pair) { values.push(pair.value) });
    return values;
  },
  
  valuesAt: function() {
    var i = arguments.length, results = [];
    while (i--) results.push(this.get(arguments[i]));
    return results;
  }
});

JS.Hash.include({
  includes: JS.Hash.instanceMethod('hasKey'),
  index:    JS.Hash.instanceMethod('key'),
  put:      JS.Hash.instanceMethod('store')
}, true);