var chafe = require('./chafe');

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

// sane: chain method calls on any object

var birthday = party();
var chain = chafe(birthday)                  // this: { guests: [] }
  .invite("Mary")                            // this: { guests: ["Mary"] }
  .invite("Isla")                            // this: { guests: ["Mary", "Isla"] }
  .invite("Sam");                            // this: { guests: ["Mary", "Isla", "Sam"] }
console.log(chain.describe().chafe.value()); // prints "Mary and Isla and Sam are dancing"

// sanish: switch to pass mode to
//         have each return value be
//         `this` in the next function

chain.chafe.pass()                           // this: "Mary and Isla and Sam are dancing"
  .toUpperCase();                            // this: "MARY AND ISLA AND SAM ARE DANCING"
console.log(chain.chafe.value());            // prints "MARY AND ISLA AND SAM ARE DANCING"

// mental: bind a function as a method
//         to the current `this`

                                             // this: "MARY AND ISLA AND SAM ARE DANCING"
chain.chafe.adhoc(function(punc) {
  return this + punc;
}, "!");                                     // this: "MARY AND ISLA AND SAM ARE DANCING!"
console.log(chain.chafe.value());            // prints "MARY AND ISLA AND SAM ARE DANCING!"
