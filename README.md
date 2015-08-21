# gherk
[![npm version](https://badge.fury.io/js/gherk.svg)](http://badge.fury.io/js/gherk)
[![build status](https://travis-ci.org/bakerface/gherk.svg?branch=master)](https://travis-ci.org/bakerface/gherk)
[![code climate](https://codeclimate.com/github/bakerface/gherk/badges/gpa.svg)](https://codeclimate.com/github/bakerface/gherk)
[![test coverage](https://codeclimate.com/github/bakerface/gherk/badges/coverage.svg)](https://codeclimate.com/github/bakerface/gherk/coverage)
[![github issues](https://img.shields.io/github/issues/bakerface/gherk.svg)](https://github.com/bakerface/gherk/issues)
[![dependencies](https://david-dm.org/bakerface/gherk.svg)](https://david-dm.org/bakerface/gherk)
[![dev dependencies](https://david-dm.org/bakerface/gherk/dev-status.svg)](https://david-dm.org/bakerface/gherk#info=devDependencies)
[![downloads](http://img.shields.io/npm/dm/gherk.svg)](https://www.npmjs.com/package/gherk)

### gherk.parse(text)

Given a feature file named **drink.feature** with the contents:

```
Feature: Can drink beer when thirsty
  As a drinker
  I want to take beer off the wall
  In order to satisfy my thirst

  Scenario: Can take a single beer
    Given 100 bottles of beer on the wall
    When a bottle is taken down
    Then there are 99 bottles of beer on the wall

  Scenario: Can take multiple beers
    Given 100 bottles of beer on the wall
    When 5 bottles are taken down
    Then there are 95 bottles of beer on the wall

  Scenario: Ghosts can drink
    Given 100 bottles of beer on the wall
    And there is nobody in the room
    When 5 bottles are taken down
    And they are floating in the air
    Then there are 95 bottles of beer on the wall
    And there are ghosts in the room
```

When calling the `parse` function:

``` javascript
var fs = require('fs');
var gherk = require('gherk');
var file = fs.readFileSync('drink.feature');

console.log(gherk.parse(file));
```

Then the following JSON object is returned:

``` javascript
[
  {
    feature: 'Can drink beer when thirsty',
    perspective: 'drinker',
    desire: 'to take beer off the wall',
    reason: 'to satisfy my thirst',
    scenarios: [
      {
        scenario: 'Can take a single beer',
        given: [
          '100 bottles of beer on the wall'
        ],
        when: [
          'a bottle is taken down'
        ],
        then: [
          'there are 99 bottles of beer on the wall'
        ]
      },
      {
        scenario: 'Can take multiple beers',
        given: [
          '100 bottles of beer on the wall'
        ],
        when: [
          '5 bottles are taken down'
        ],
        then: [
          'there are 95 bottles of beer on the wall'
        ]
      },
      {
        scenario: 'Ghosts can drink',
        given: [
          '100 bottles of beer on the wall',
          'there is nobody in the room'
        ],
        when: [
          '5 bottles are taken down',
          'they are floating in the air'
        ],
        then: [
          'there are 95 bottles of beer on the wall',
          'there are ghosts in the room'
        ]
      }
    ]
  }
]
```

### gherk.test()

Given a feature file named **drink.feature** with the contents:

```
Feature: Can drink beer when thirsty
  As a drinker
  I want to take beer off the wall
  In order to satisfy my thirst

  Scenario: Can take a single beer
    Given 100 bottles of beer on the wall
    When a bottle is taken down
    Then there are 99 bottles of beer on the wall

  Scenario: Can take multiple beers
    Given 100 bottles of beer on the wall
    When 5 bottles are taken down
    Then there are 95 bottles of beer on the wall
```

When calling the `test` function:

``` javascript
var fs = require('fs');
var gherk = require('gherk');
var test = gherk.test();
var file = fs.readFileSync('drink.feature');

test.beforeFeature(function(feature, next) {
  // this runs before each feature
  next();
});

test.afterFeature(function(feature, next) {
  // this runs after each feature
  next();
});

test.beforeScenario(function(feature, scenario, next) {
  // this runs before each scenario
  next();
});

test.afterScenario(function(feature, scenario, next) {
  // this runs after each scenario
  next();
});

test.given(/(\d+) bottles of beer on the wall/,
  function(bottles, next) {
    this.bottles = parseInt(bottles);
    next();
  });

test.when(/(\d+) bottles are taken down/,
  function(bottles, next) {
    this.bottles -= parseInt(bottles);
    next();
  });

test.when(/a bottle is taken down/,
  function(next) {
    this.bottles--;
    next();
  });

test.then(/there are (\d+) bottles of beer on the wall/,
  function(bottles, next) {
    next(this.bottles != parseInt(bottles));
  });

test(file, function(e) {
  // this callback is optional
  // if excluded, any errors are thrown
});
```

Then the scenarios are executed sequentially using the pre-defined actions.
