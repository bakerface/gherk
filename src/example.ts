import { parse } from ".";

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

console.log(JSON.stringify(features, null, 2));
