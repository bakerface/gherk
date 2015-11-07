var fs = require('fs');
var gherk = require('..');
var should = require('should');

var file = fs.readFileSync('drink.feature');
var test = gherk();

test.given(/(\d+) bottles of beer on the wall/,
  function(bottles) {
    this.bottles = parseInt(bottles);
  });

test.when(/(\d+) bottles are taken down/,
  function(bottles) {
    this.bottles -= parseInt(bottles);
  });

test.when(/a bottle is taken down/,
  function() {
    this.bottles--;
  });

test.then(/there are (\d+) bottles of beer on the wall/,
  function(bottles) {
    should(this.bottles).eql(parseInt(bottles));
  });

test.run(file);

