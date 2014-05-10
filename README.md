# Chafe

Chain functions.  Probably horrible.

* By Mary Rose Cook
* http://maryrosecook.com
* maryrosecook@maryrosecook.com

## Example

### Setup

Let's organise a party.

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

### Sane

Chain method calls on any object.

    var birthday = party();
    var chain = chafe(birthday);       // this: { guests: [] }
    chain.invite("Mary")               // this: { guests: ["Mary"] }
      .invite("Isla")                  // this: { guests: ["Mary", "Isla"] }
      .invite("Sam")                   // this: { guests: ["Mary", "Isla", "Sam"] }
      .describe();
    console.log(chain.chafe.value());  // prints "Mary and Isla and Sam are dancing"

### A bit loopy

Switch to pass mode to have each return value be `this` in the next function.

    chain.chafe.pass()                 // this: "Mary and Isla and Sam are dancing"
      .toUpperCase();                  // this: "MARY AND ISLA AND SAM ARE DANCING"
    console.log(chain.chafe.value());  // prints "MARY AND ISLA AND SAM ARE DANCING"

### Mental

Bind a function as a method.

                                       // this: "MARY AND ISLA AND SAM ARE DANCING"
    chain.chafe.adhoc(function(punc) {
      return this + punc;
    }, "!");                           // this: "MARY AND ISLA AND SAM ARE DANCING!"
    console.log(chain.chafe.value());  // prints "MARY AND ISLA AND SAM ARE DANCING!"
