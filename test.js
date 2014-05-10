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


 var birthday = party();
    var chain = chafe(birthday);                 // this: { guests: [] }
    chain.invite("Mary")                            // this: { guests: ["Mary"] }
      .invite("Isla")                            // this: { guests: ["Mary", "Isla"] }
      .invite("Sam")                            // this: { guests: ["Mary", "Isla", "Sam"] }
      .describe();
    console.log(chain.chafe.value());

chain.chafe.pass()                           // this: "Mary and Isla and Sam are dancing"
      .toUpperCase();                            // this: "MARY AND ISLA AND SAM ARE DANCING"
    console.log(chain.chafe.value());

                                                 // this: "MARY AND ISLA AND SAM ARE DANCING"
    chain.chafe.adhoc(function(punc) {
      return this + punc;
    }, "!");                                     // this: "MARY AND ISLA AND SAM ARE DANCING!"
    console.log(chain.chafe.value());            // prints "MARY AND ISLA AND SAM ARE DANCING!"
