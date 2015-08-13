var gherk = module.exports = {
  parse: parse
};

var FEATURE_REGEX = /^Feature:\s*(.*)\s*$/;
var PERSPECTIVE_REGEX = /^\s+As a\s+(.*)\s*$/;
var DESIRE_REGEX = /^\s+I want\s+(.*)\s*$/;
var REASON_REGEX = /^\s+In order\s+(.*)\s*$/;
var SCENARIO_REGEX = /^\s+Scenario:\s*(.*)\s*$/;
var GIVEN_REGEX = /^\s+Given\s+(.*)\s*$/;
var WHEN_REGEX = /^\s+When\s+(.*)\s*$/;
var THEN_REGEX = /^\s+Then\s+(.*)\s*$/;
var AND_REGEX = /^\s+And\s+(.*)\s*$/;

function parse(text) {
  var previous;

  return (text || '').split(/\r?\n/g).reduce(function(features, line) {
    if (match = line.match(FEATURE_REGEX)) {
      features.push({
        feature: match[1],
        scenarios: [ ]
      });
    }
    else if (match = line.match(PERSPECTIVE_REGEX)) {
      var feature = features.pop();
      feature.perspective = match[1];
      features.push(feature);
    }
    else if (match = line.match(DESIRE_REGEX)) {
      var feature = features.pop();
      feature.desire = match[1];
      features.push(feature);
    }
    else if (match = line.match(REASON_REGEX)) {
      var feature = features.pop();
      feature.reason = match[1];
      features.push(feature);
    }
    else if (match = line.match(SCENARIO_REGEX)) {
      var feature = features.pop();

      feature.scenarios.push({
        scenario: match[1],
        given: [ ],
        when: [ ],
        then: [ ]
      });

      features.push(feature);
    }
    else if (match = line.match(GIVEN_REGEX)) {
      var feature = features.pop();
      var scenario = feature.scenarios.pop();

      previous = scenario.given;
      scenario.given.push(match[1]);

      feature.scenarios.push(scenario);
      features.push(feature);
    }
    else if (match = line.match(WHEN_REGEX)) {
      var feature = features.pop();
      var scenario = feature.scenarios.pop();

      previous = scenario.when;
      scenario.when.push(match[1]);

      feature.scenarios.push(scenario);
      features.push(feature);
    }
    else if (match = line.match(THEN_REGEX)) {
      var feature = features.pop();
      var scenario = feature.scenarios.pop();

      previous = scenario.then;
      scenario.then.push(match[1]);

      feature.scenarios.push(scenario);
      features.push(feature);
    }
    else if (match = line.match(AND_REGEX)) {
      previous.push(match[1]);
    }

    return features;
  }, []);
}
