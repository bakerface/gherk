/**
 * Copyright (c) 2015 Christopher M. Baker
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

var should = require('should');
var gherk = require('..');

describe('gherk()', function() {
  var test, feature = [
    'Feature: Can drink beer when thirsty',
    '  As a drinker',
    '  I want to take beer off the wall',
    '  In order to satisfy my thirst',
    '',
    '  Scenario: Can take a single beer',
    '    Given 100 bottles of beer on the wall',
    '    When a bottle is taken down',
    '    Then there are 99 bottles of beer on the wall',
    '',
    '  Scenario: Can take multiple beers',
    '    Given 100 bottles of beer on the wall',
    '    When 5 bottles are taken down',
    '    Then there are 95 bottles of beer on the wall',
    '',
    '  Scenario: Ghosts can drink',
    '    Given 100 bottles of beer on the wall',
    '    And there is nobody in the room',
    '    When 5 bottles are taken down',
    '    And they are floating in the air',
    '    Then there are 95 bottles of beer on the wall',
    '    And there are ghosts in the room'
  ].join('\r\n');

  beforeEach(function() {
    test = gherk();
  })

  it('should throw an error for unhandled given', function(done) {
    try {
      test.run(feature);
    }
    catch (e) {
      should(e).eql(new ReferenceError('100 bottles of beer on the wall'));
      done();
    }
  })

  it('should throw an error for unhandled when', function(done) {
    test.given(/(\d+) bottles of beer on the wall/, function(bottles) {

    });

    try {
      test.run(feature);
    }
    catch (e) {
      should(e).eql(new ReferenceError('a bottle is taken down'));
      done();
    }
  })

  it('should throw an error for unhandled then', function(done) {
    test.given(/(\d+) bottles of beer on the wall/, function(bottles) {

    });

    test.when(/a bottle is taken down/, function() {

    });

    try {
      test.run(feature);
    }
    catch (e) {
      should(e).eql(new ReferenceError('there are 99 bottles of beer on the wall'));
      done();
    }
  })

  it('should call the handler functions for each line', function() {
    test.given(/(\d+) bottles of beer on the wall/, function(bottles) {
      this.bottles = parseInt(bottles);
    });

    test.given(/there is nobody in the room/, function() {

    });

    test.when(/a bottle is taken down/, function() {
      this.bottles--;
    });

    test.when(/(\d+) bottles are taken down/, function(bottles) {
      this.bottles -= parseInt(bottles);
    });

    test.when(/they are floating in the air/, function() {

    });

    test.then(/there are (\d+) bottles of beer on the wall/, function(bottles) {
      should(this.bottles).eql(parseInt(bottles));
    });

    test.then(/there are ghosts in the room/, function() {

    });

    test.run(feature);
  })
})
