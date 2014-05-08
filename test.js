var Person = function() {
  this.name = "";
  this.eyeColor = "";
}

Person.prototype = {
  setName: function(name) {
    this.name = name;
  },

  setEyeColor: function(eyeColor) {
    this.eyeColor = eyeColor;
  },

  sayHi: function() {
    return "Hi, my name is " +
      this.name +
      " and I have " +
      this.eyeColor +
      " eyes.";
  }
};

var chafe = require('./chafe');

var hi = chafe(new Person())
  .keep()
  .setName("Mary")
  .setEyeColor("blue")
  .tap(function(obj) { console.log(obj); })
  .sayHi()
  .force();
console.log(hi)
