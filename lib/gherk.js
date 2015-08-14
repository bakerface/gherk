module.exports = {
  parse: parse
};

function matcher(regex, part) {
  var match;

  function is(line) {
    match = line.match(regex);

    if (match) {
      match = match[part];
    }

    return match;
  }

  function get() {
    return match;
  }

  return {
    is: is,
    get: get
  };
}

var feature_matcher = matcher(/^Feature:\s*(.*)\s*$/, 1);
var perspective_matcher = matcher(/^\s+As a\s+(.*)\s*$/, 1);
var desire_matcher = matcher(/^\s+I want\s+(.*)\s*$/, 1);
var reason_matcher = matcher(/^\s+In order\s+(.*)\s*$/, 1);
var scenario_matcher = matcher(/^\s+Scenario:\s*(.*)\s*$/, 1);
var given_matcher = matcher(/^\s+Given\s+(.*)\s*$/, 1);
var when_matcher = matcher(/^\s+When\s+(.*)\s*$/, 1);
var then_matcher = matcher(/^\s+Then\s+(.*)\s*$/, 1);
var and_matcher = matcher(/^\s+And\s+(.*)\s*$/, 1);

function parse(text) {
  var previous, feature, scenario;

  return ('' + text).split(/\r?\n/g).reduce(function(features, line) {
    if (feature_matcher.is(line)) {
      features.push({
        feature: feature_matcher.get(),
        scenarios: [ ]
      });
    }
    else if (perspective_matcher.is(line)) {
      feature = features.pop();
      feature.perspective = perspective_matcher.get();
      features.push(feature);
    }
    else if (desire_matcher.is(line)) {
      feature = features.pop();
      feature.desire = desire_matcher.get();
      features.push(feature);
    }
    else if (reason_matcher.is(line)) {
      feature = features.pop();
      feature.reason = reason_matcher.get();
      features.push(feature);
    }
    else if (scenario_matcher.is(line)) {
      feature = features.pop();

      feature.scenarios.push({
        scenario: scenario_matcher.get(),
        given: [ ],
        when: [ ],
        then: [ ]
      });

      features.push(feature);
    }
    else if (given_matcher.is(line)) {
      feature = features.pop();
      scenario = feature.scenarios.pop();

      previous = scenario.given;
      scenario.given.push(given_matcher.get());

      feature.scenarios.push(scenario);
      features.push(feature);
    }
    else if (when_matcher.is(line)) {
      feature = features.pop();
      scenario = feature.scenarios.pop();

      previous = scenario.when;
      scenario.when.push(when_matcher.get());

      feature.scenarios.push(scenario);
      features.push(feature);
    }
    else if (then_matcher.is(line)) {
      feature = features.pop();
      scenario = feature.scenarios.pop();

      previous = scenario.then;
      scenario.then.push(then_matcher.get());

      feature.scenarios.push(scenario);
      features.push(feature);
    }
    else if (and_matcher.is(line)) {
      previous.push(and_matcher.get());
    }

    return features;
  }, [ ]);
}
