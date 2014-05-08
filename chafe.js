;(function() {
  var chafe = function(obj) {
    return new ObjWrapper(obj);
  };

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

  var Chain = function(chainableObj, obj) {
    this.context = new Context(obj, undefined, "keep");
    this.chainableObj = chainableObj;
    this.actions = [];
    chainFns.addFunctionIntercepts(this);
  };

  Chain.prototype = {
    keep: function() {
      chainFns.addAction(this, function(ctx) {
        return new Context(ctx.obj, ctx.ret, "keep");
      });

      return this.chainableObj;
    },

    pass: function() {
      chainFns.addAction(this, function(ctx) {
        return new Context(ctx.ret, ctx.ret, "pass");
      });

      return this.chainableObj;
    },

    force: function() {
      for (var i = 0; i < this.actions.length; i++) {
        this.context = this.actions[i](this.context);
        chainFns.clearFunctionIntercepts(this);
        chainFns.addFunctionIntercepts(this);
      }

      this.actions = [];
      return this.context.ret;
    },

    tap: function(fn) {
      chainFns.addAction(this, function(ctx) {
        fn(ctx.obj);
        return ctx;
      });

      return this.chainableObj;
    }
  };

  var chainFns = {
    addFunctionIntercepts: function(chain) {
      var interceptFns = this.interceptFunctions(chain, chain.context.obj);
      chain.interceptedFnIds = keys(interceptFns);
      mixin(interceptFns, chain.chainableObj);
    },

    clearFunctionIntercepts: function(chain) {
      for (var i = 0; i < chain.interceptedFnIds.length; i++) {
        chain.chainableObj[chain.interceptedFnIds[i]] = undefined;
      }
    },

    createChainableMethod: function(chain, fnName) {
      var self = this;
      return function() {
        var args = arguments;
        self.addAction(chain, function(ctx) {
          return new Context(ctx.obj, ctx.obj[fnName].apply(ctx.obj, args), ctx.mode);
        });

        return chain.chainableObj;
      };
    },

    interceptFunctions: function(chain, obj) {
      var interceptFunctions = {};
      for (var i in obj) {
        if (obj[i] instanceof Function) {
          interceptFunctions[i] = this.createChainableMethod(chain, i);
        }
      }

      return interceptFunctions;
    },

    addAction: function(chain, fn) {
      chain.actions.push(fn);
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
