;(function() {
  var chafe = function(obj) {
    return new ObjWrapper(obj);
  };

  var root = this;

  var Ctx = function(obj, ret, mode) {
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

  var Chain = function(objWrapper, obj) {
    this.ctx = new Ctx(obj, undefined, "keep");
    this.objWrapper = objWrapper;
    this.keep();
  };

  var chainHelpers = {
    setCtx: function(chain, ctx) {
      chain.ctx = ctx;
      chainHelpers.clearFunctionIntercepts(chain);
      chainHelpers.addFunctionIntercepts(chain);
    },

    addFunctionIntercepts: function(chain) {
      var interceptFns = this.interceptFunctions(chain, chain.ctx.obj);
      chain.interceptedFnIds = keys(interceptFns);
      mixin(interceptFns, chain.objWrapper);
    },

    clearFunctionIntercepts: function(chain) {
      if (chain.interceptedFnIds !== undefined) {
        for (var i = 0; i < chain.interceptedFnIds.length; i++) {
          chain.objWrapper[chain.interceptedFnIds[i]] = undefined;
        }
      }
    },

    createChainableMethod: function(chain, fn) {
      return function() {
        var result = fn.apply(chain.ctx.obj, arguments);
        var obj = chain.ctx.mode === "keep" ? chain.ctx.obj : result;
        chainHelpers.setCtx(chain, new Ctx(obj, result, chain.ctx.mode));
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
          interceptFunctions[fnName] = this.createChainableMethod(chain, obj[fnName]);
        }
      }

      return interceptFunctions;
    }
  };

  var type = function(x) {
    return Object.prototype.toString.call(x).match(/\[object ([^\]]+)\]/)[1];
  };

  Chain.prototype = {
    keep: function() {
      chainHelpers.setCtx(this, new Ctx(this.ctx.obj, this.ctx.ret, "keep"));
      return this.objWrapper;
    },

    pass: function() {
      chainHelpers.setCtx(this, new Ctx(this.ctx.ret, this.ctx.ret, "pass"));
      return this.objWrapper;
    },

    value: function() {
      return this.ctx.ret;
    },

    tap: function(fn) {
      fn(this.ctx.obj);
      return this.objWrapper;
    },

    adhoc: function(fn) {
      chainHelpers.createChainableMethod(this, fn).apply(null, toArray(arguments).slice(1));
      return this.objWrapper;
    }
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
