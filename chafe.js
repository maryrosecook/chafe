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

    this.chafe = new Chafer(this, obj); // split ObjWrapper namespace from chain obj namespace
  };

  var Chafer = function(chainableObj, obj) {
    this.context = new Context(obj, undefined, "keep");
    this.chainableObj = chainableObj;
    this.actions = [];
    chaferFns.addFunctionIntercepts(this);
  };

  Chafer.prototype = {
    keep: function() {
      chaferFns.addAction(this, function(ctx) {
        return new Context(ctx.obj, ctx.ret, "keep");
      });

      return this.chainableObj;
    },

    pass: function() {
      chaferFns.addAction(this, function(ctx) {
        return new Context(ctx.ret, ctx.ret, "pass");
      });

      return this.chainableObj;
    },

    force: function() {
      for (var i = 0; i < this.actions.length; i++) {
        this.context = this.actions[i](this.context);
        chaferFns.clearFunctionIntercepts(this);
        chaferFns.addFunctionIntercepts(this);
      }

      this.actions = [];
      return this.context.ret;
    },

    tap: function(fn) {
      chaferFns.addAction(this, function(ctx) {
        fn(ctx.obj);
        return ctx;
      });

      return this.chainableObj;
    }
  };

  var chaferFns = {
    addFunctionIntercepts: function(chafer) {
      var interceptFns = this.interceptFunctions(chafer, chafer.context.obj);
      chafer.interceptedFnIds = keys(interceptFns);
      mixin(interceptFns, chafer.chainableObj);
    },

    clearFunctionIntercepts: function(chafer) {
      for (var i = 0; i < chafer.interceptedFnIds.length; i++) {
        chafer.chainableObj[chafer.interceptedFnIds[i]] = undefined;
      }
    },

    createChainableMethod: function(chafer, fnName) {
      var self = this;
      return function() {
        var args = arguments;
        self.addAction(chafer, function(ctx) {
          return new Context(ctx.obj, ctx.obj[fnName].apply(ctx.obj, args), ctx.mode);
        });

        return chafer.chainableObj;
      };
    },

    interceptFunctions: function(chafer, obj) {
      var interceptFunctions = {};
      for (var i in obj) {
        if (obj[i] instanceof Function) {
          interceptFunctions[i] = this.createChainableMethod(chafer, i);
        }
      }

      return interceptFunctions;
    },

    addAction: function(chafer, fn) {
      chafer.actions.push(fn);
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
