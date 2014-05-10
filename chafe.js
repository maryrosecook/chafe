;(function() {
  var chafe = function(obj) {
    return new ObjWrapper(obj);
  };

  var root = this;

  var Context = function(obj, ret, mode) {
    this.obj = obj;
    this.ret = ret;
    this.mode = mode;
  };

  var ObjWrapper = function(obj) {
    if (obj.chafe !== undefined) {
      throw "The object you are chaining on has a property called chafe. Aborting.";
    }

    this.chafe = new Chain(this, obj); // split ObjWrapper namespace from chain obj namespace
  };

  var toArray = function(args) {
    return Array.prototype.slice.call(args);
  };

  var purify = function() {
    var args = toArray(arguments);
    return args[0].apply(null, [args[1]].concat(args.slice(2)));
  };

  var Chain = function(objWrapper, obj) {
    this.context = new Context(obj, undefined, "keep");
    this.objWrapper = objWrapper;
    this.keep();
  };

  var chainHelpers = {
    addFunctionIntercepts: function(chain) {
      var interceptFns = this.interceptFunctions(chain, chain.context.obj);
      chain.interceptedFnIds = keys(interceptFns);
      mixin(interceptFns, chain.objWrapper);
    },

    clearFunctionIntercepts: function(chain) {
      if (chain.interceptedFnIds !== undefined) {
        chain.objWrapper.prototype = chain.context.obj;
        for (var i = 0; i < chain.interceptedFnIds.length; i++) {
          chain.objWrapper[chain.interceptedFnIds[i]] = undefined;
        }
      }
    },

    createChainableMethod: function(chain, fnName) {
      return function() {
        var result = chain.context.obj[fnName].apply(chain.context.obj, arguments);
        var obj = chain.context.mode === "keep" ? chain.context.obj : result;
        chain.context = new Context(obj, result, chain.context.mode);
        return chain.objWrapper;
      };
    },

    interceptFunctions: function(chain, obj) {
      var fnNames = [];
      if (type(obj) === "Object") {
        for (var i in obj) {
          fnNames.push(i);
        }
      } else { // Array, String etc
        fnNames = Object.getOwnPropertyNames(root[type(obj)].prototype);
      }

      var interceptFunctions = [];
      for (var i = 0; i < fnNames.length; i++) {
        var fnName = fnNames[i];
        if (obj[fnName] instanceof Function) {
          interceptFunctions[fnName] = this.createChainableMethod(chain, fnName);
        }
      }

      return interceptFunctions;
    }
  };

  var type = function(x) {
    return Object.prototype.toString.call(x).match(/\[object ([^\]]+)\]/)[1];
  };

  var chainApi = {
    keep: function(chain) {
      chain.context = new Context(chain.context.obj, chain.context.ret, "keep");
      chainHelpers.clearFunctionIntercepts(chain);
      chainHelpers.addFunctionIntercepts(chain);
      return chain.objWrapper;
    },

    pass: function(chain) {
      chain.context = new Context(chain.context.ret, chain.context.ret, "pass");
      chainHelpers.clearFunctionIntercepts(chain);
      chainHelpers.addFunctionIntercepts(chain);
      return chain.objWrapper;
    },

    value: function(chain) {
      return chain.context.ret;
    },

    tap: function(chain, fn) {
      fn(this.context.obj);
      return chain.objWrapper;
    }
  };

  Chain.prototype = {
    keep: function() { return purify(chainApi.keep, this) },
    pass: function() { return purify(chainApi.pass, this) },
    value: function() { return purify(chainApi.value, this) },
    tap: function(fn) { return purify(chainApi.tap, this, fn) }
  };

  var keys = function(obj) {
    var keys = [];
    for (var i in obj) {
      keys.push(i);
    }

    return keys;
  };

  var intersection = function(array1, array2) {
    var intersection = [];
    for (var i = 0; i < array1.length; i++) {
      for (var j = 0; j < array2.length; j++) {
        if (array1[i] === array2[j]) {
          intersection.push(array1[i]);
        }
      }
    }

    return intersection;
  };

  var mixin = function(from, to) { // make this functional
    for (var i in from) {
      to[i] = from[i];
    }

    return to;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = chafe;
    }
    exports.chafe = chafe;
  } else {
    this['chafe'] = chafe;
  }
})();
