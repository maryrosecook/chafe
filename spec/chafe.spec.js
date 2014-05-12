var chafe = require('../chafe');

var party = function() {
  return {
    guests: [],

    invite: function(name) {
      this.guests.push(name);
    },

    describe: function() {
      return this.guests.join(" and ") + " are dancing";
    }
  };
};

describe('chafe', function() {
  it('should pass back this after keep() chain then this()', function() {
    expect(chafe(party())
           .invite("Sam")
           .invite("Mary")
           .chafe.this().guests).toEqual(["Sam", "Mary"]);
  });

  it('should pass back final return val after keep() chain then value()', function() {
    expect(chafe(party())
           .invite("Sam")
           .invite("Mary")
           .describe()
           .chafe.value()).toEqual("Sam and Mary are dancing");
  });

  it('should use return as next this when pass() used', function() {
    expect(chafe(party())
           .invite("Sam")
           .invite("Mary")
           .describe()
           .chafe.pass()
           .toUpperCase()
           .chafe.value()).toEqual("SAM AND MARY ARE DANCING");
  });

  it('should stay passing when pass() run repeatedly', function() {
    expect(chafe(party())
           .invite("Sam")
           .invite("Mary")
           .describe()
           .chafe.pass()
           .chafe.pass()
           .chafe.value()).toEqual("Sam and Mary are dancing");
  });

  it('should be able to do immediate pass() and get obj back', function() {
    expect(chafe(party())
           .chafe.pass()
           .chafe.value().guests).toEqual([]);
  });

  it('should be able to switch back to keeping when pass used', function() {
    var objSwap = {
      a: function() { return { a: "a", fn: function() { return { b: "b" }} } },
    };

    expect(chafe(objSwap)
           .chafe.pass()
           .a()
           .chafe.keep()
           .fn()
           .chafe.this()
           .a).toEqual("a");
  });

  it('should be able to glom on temp method with adhoc', function() {
    expect(chafe(party())
           .invite("Sam")
           .chafe.adhoc(function() { return this.guests.length; })
           .chafe.value()).toEqual(1);
  });

  it('should throw if chained obj has member `chafe`', function() {
    expect(function() {
      chafe({ chafe: "chafe" })
    }).toThrow("The object you are chaining on has a property called chafe. Aborting.");
  });
});
