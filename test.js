var person = function() {
  return {
    name: "",

    setName: function(name) {
      this.name = name;
    },

    sayHi: function() {
      return "Hi, I'm " + this.name;
    }
  };
};

var chafe = require('./chafe');

var mary = person();
var hi = chafe(mary)               // this: mary
    .setName("Mary")               // mary.setName()
    .sayHi()                       // mary.sayHi()
    .chafe.pass()                  // this: "Hi, I'm"
    .toUpperCase()                 // "Hi, I'm Mary".toUpperCase()
    .chafe.adhoc(function(punc) {
      return this + punc;
    }, "!")                        // "HI, I'M MARY".anon("!")
    .chafe.value();                // => "HI, I'M MARY!"

console.log(hi);
