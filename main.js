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

var parse = require('./parse');

module.exports = function(world) {
  return new Suite(world);
};

function Suite(world) {
  this._world = world || { };
  this._given = [];
  this._when = [];
  this._then = [];
}

Suite.prototype.resolve = function(list, text) {
  for (var i = 0; i < list.length; i++) {
    var match = text.match(list[i].r);

    if (match) {
      match[0] = this._world;
      return Function.prototype.bind.apply(list[i].f, match);
    }
  }

  throw new ReferenceError(text);
};

Suite.prototype.given = function(r, f) {
  this._given.push({ r: r, f: f });
};

Suite.prototype.resolveGiven = function(text) {
  return this.resolve(this._given, text);
};

Suite.prototype.when = function(r, f) {
  this._when.push({ r: r, f: f });
};

Suite.prototype.resolveWhen = function(text) {
  return this.resolve(this._when, text);
};

Suite.prototype.then = function(r, f) {
  this._then.push({ r: r, f: f });
};

Suite.prototype.resolveThen = function(text) {
  return this.resolve(this._then, text);
};

Suite.prototype.run = function(text) {
  var features = parse(text);
  var suite = this;

  features.forEach(function(feature) {
    describe('Feature: ' + feature.feature, function() {
      feature.scenarios.forEach(function(scenario) {
        describe('Scenario: ' + scenario.scenario, function() {
          scenario.given.forEach(function(g) {
            it('Given ' + g, suite.resolveGiven(g));
          });

          scenario.when.forEach(function(w) {
            it('When ' + w, suite.resolveWhen(w));
          });

          scenario.then.forEach(function(t) {
            it('Then ' + t, suite.resolveThen(t));
          });
        });
      });
    });
  });
};
