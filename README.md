# gherk
[![npm version](https://badge.fury.io/js/gherk.svg)](http://badge.fury.io/js/gherk)
[![dependencies](https://david-dm.org/bakerface/gherk.svg)](https://david-dm.org/bakerface/gherk)
[![dev dependencies](https://david-dm.org/bakerface/gherk/dev-status.svg)](https://david-dm.org/bakerface/gherk#info=devDependencies)
[![downloads](http://img.shields.io/npm/dm/gherk.svg)](https://www.npmjs.com/package/gherk)

A minimalistic parser for the Gherkin syntax.

``` typescript
import { parse } from "gherk";

const features = parse(`
Feature: Can drink beer when thirsty

  As a drinker
  I want to take beer off the wall
  in order to satisfy my thirst

  Background:
    Given 100 bottles of beer on the wall

  Scenario: Can take a single beer
    When a bottle is taken down
    Then there are 99 bottles of beer on the wall

  Scenario: Can take multiple beers
    When 5 bottles are taken down
    Then there are 95 bottles of beer on the wall

  Scenario: Ghosts can drink
    Given there is nobody in the room
    When 5 bottles are taken down
    And they are floating in the air
    Then there are 95 bottles of beer on the wall
    And there are ghosts in the room
`);

console.log(features);
```

The code snippet above would output the following JSON object to your console.

``` json
[
  {
    "name": "Can drink beer when thirsty",
    "description": "As a drinker I want to take beer off the wall in order to satisfy my thirst",
    "backgrounds": [
      {
        "name": "",
        "description": "",
        "givens": [
          "100 bottles of beer on the wall"
        ]
      }
    ],
    "scenarios": [
      {
        "name": "Can take a single beer",
        "description": "",
        "givens": [],
        "whens": [
          "a bottle is taken down"
        ],
        "thens": [
          "there are 99 bottles of beer on the wall"
        ]
      },
      {
        "name": "Can take multiple beers",
        "description": "",
        "givens": [],
        "whens": [
          "5 bottles are taken down"
        ],
        "thens": [
          "there are 95 bottles of beer on the wall"
        ]
      },
      {
        "name": "Ghosts can drink",
        "description": "",
        "givens": [
          "there is nobody in the room"
        ],
        "whens": [
          "5 bottles are taken down",
          "they are floating in the air"
        ],
        "thens": [
          "there are 95 bottles of beer on the wall",
          "there are ghosts in the room"
        ]
      }
    ]
  }
]
```
