var should = require('should');
var gherk = require('..');

describe('gherk.parse(text)', function() {
  it('should return undefined when text is undefined', function() {
    should(gherk.parse()).eql(undefined);
  })
})
