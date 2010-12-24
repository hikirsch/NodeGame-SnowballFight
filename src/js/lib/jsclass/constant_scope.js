JS.ConstantScope = new JS.Module('ConstantScope', {
  extend: {
    included: function(base) {
      base.__consts__ = new JS.Module();
      base.extend(this.ClassMethods);
      
      base.include(base.__consts__);
      base.extend(base.__consts__);
      
      base.include(base.__mod__.__fns__);
      base.extend(base.__eigen__().__fns__);
    },
    
    ClassMethods: new JS.Module({
      extend: function() {
        var constants = JS.ConstantScope.extract(arguments[0], this);
        this.__consts__.include(constants);
        this.callSuper();
      },
      
      include: function() {
        var constants = JS.ConstantScope.extract(arguments[0], this);
        this.__consts__.include(constants);
        this.callSuper();
      }
    }),
    
    extract: function(inclusions, base) {
      if (!inclusions) return null;
      if (JS.isType(inclusions, JS.Module)) return null;
      var constants = {}, key, object;
      for (key in inclusions) {
        
        if (!/^[A-Z]/.test(key)) continue;
        
        object = inclusions[key];
        constants[key] = object;
        delete inclusions[key];
        
        if (JS.isType(object, JS.Module)) {
          object.include(this);
          object.__consts__.include(base.__consts__);
        }
      }
      return constants;
    }
  }
});