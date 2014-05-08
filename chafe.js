;(function() {
  var chafe = function(obj) {
    return new ChainableObj(obj);
  };

  var Context = function(obj, ret, mode) {
    this.obj = obj;
    this.ret = ret;
    this.mode = mode;
  };

  var ChainableObj = function(obj) {
    abortIfDuplicateKeys(obj);
    this.context = new Context(obj, undefined, "keep");
    this.actions = [];

    this._addFunctionIntercepts();
  };

  ChainableObj.prototype = {
    keep: function() {
      this._addAction(function(ctx) {
        return new Context(ctx.obj, ctx.ret, "keep");
      });

      return this;
    },

    pass: function() {
      this._addAction(function(ctx) {
        return new Context(ctx.ret, ctx.ret, "pass");
      });

      return this;
    },

    force: function() {
      for (var i = 0; i < this.actions.length; i++) {
        this.context = this.actions[i](this.context);
        this._clearFunctionIntercepts();
        this._addFunctionIntercepts();
      }

      this.actions = [];
      return this.context.ret;
    },

    tap: function(fn) {
      this._addAction(function(ctx) {
        fn(ctx.obj);
        return ctx;
      });

      return this;
    },

    _addFunctionIntercepts: function() {
      var interceptFns = this._interceptFunctions(this.context.obj);
      this._interceptedFnIds = keys(interceptFns);
      mixin(interceptFns, this);
    },

    _clearFunctionIntercepts: function() {
      for (var i = 0; i < this._interceptedFnIds.length; i++) {
        this[this._interceptedFnIds[i]] = undefined;
      }
    },

    _createChainableMethod: function(fnName) {
      var self = this;
      return function() {
        var args = arguments;
        self._addAction(function(ctx) {
          return new Context(ctx.obj, ctx.obj[fnName].apply(ctx.obj, args), ctx.mode);
        });

        return self;
      };
    },

    _interceptFunctions: function(obj) {
      var interceptFunctions = {};
      for (var i in obj) {
        if (obj[i] instanceof Function) {
          interceptFunctions[i] = this._createChainableMethod(i);
        }
      }

      return interceptFunctions;
    },

    _addAction: function(fn) {
      this.actions.push(fn);
    }
  };

  var abortIfDuplicateKeys = function(obj) {
    var duplicateKeys = intersection(keys(obj), keys(ChainableObj.prototype));
    if (duplicateKeys.length > 0) {
      throw "Some methods (" + duplicateKeys +
        ") appear on both the chained object and the Chafe API.  Aborting.";
    };
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
