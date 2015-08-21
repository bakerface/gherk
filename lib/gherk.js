module.exports = {
  parse: parse,
  test: test
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

function sequence(first, second) {
  return function(callback) {
    return first(function(e) {
      if (e) {
        return callback(e);
      }
      else {
        return second(callback);
      }
    });
  };
}

function is_truthy(x) {
  return x;
}

function test() {
  var givens = [ ];
  var whens = [ ];
  var thens = [ ];
  var before_features = [ ];
  var after_features = [ ];
  var before_scenarios = [ ];
  var after_scenarios = [ ];

  function item_map(text, item) {
    var m = text.match(item.expression);

    function map(callback) {
      return item.action.apply(this, m.slice(1).concat(callback));
    }

    if (m) {
      return map.bind(this);
    }
  }

  function get_action(list, text) {
    var map = item_map.bind(this, text);
    return list.map(map).filter(is_truthy).shift();
  }

  function feature_action_map(feature, action) {
    return action.bind(this, feature);
  }

  function scenario_action_map(feature, scenario, action) {
    return action.bind(this, feature, scenario);
  }

  function action_map(feature, scenario, list, type, text) {
    function error_action(callback) {
      var e = {
        kind: 'error#undefined-' + type,
        feature: feature,
        scenario: scenario,
        name: 'Undefined' + type.substr(0, 1).toUpperCase() + type.substr(1),
        message: [
          '"' + text + '"',
          '  in Scenario: "' + scenario + '"',
          '  in Feature: "' + feature + '"'
        ].join('\n')
      };

      e[type] = text;
      return callback(e);
    }

    return get_action(list, text) || error_action;
  }

  function given_map(feature, scenario, given) {
    return action_map(feature, scenario, givens, 'given', given);
  }

  function when_map(feature, scenario, when) {
    return action_map(feature, scenario, whens, 'when', when);
  }

  function then_map(feature, scenario, then) {
    return action_map(feature, scenario, thens, 'then', then);
  }

  function scenario_map(feature, scenario) {
    var name = scenario.scenario;
    var before = scenario_action_map.bind(this, feature, name);
    var given = given_map.bind(this, feature, name);
    var when = when_map.bind(this, feature, name);
    var then = then_map.bind(this, feature, name);
    var after = scenario_action_map.bind(this, feature, name);

    return [ ].concat(
      before_scenarios.map(before),
      scenario.given.map(given),
      scenario.when.map(when),
      scenario.then.map(then),
      after_scenarios.map(after)).reduce(sequence);
  }

  function feature_map(feature) {
    var name = feature.feature;
    var before = feature_action_map.bind(this, name);
    var scenario = scenario_map.bind(this, name);
    var after = feature_action_map.bind(this, name);

    return [ ].concat(
      before_features.map(before),
      feature.scenarios.map(scenario),
      after_features.map(after)).reduce(sequence);
  }

  function configure(text, callback) {
    var map = feature_map.bind(this);
    var run = parse(text).map(map).reduce(sequence);

    return run.call(this, callback || function(e) {
      if (e) {
        throw e;
      }
    });
  }

  configure.given = function(expression, action) {
    givens.push({ expression: expression, action: action });
  };

  configure.when = function(expression, action) {
    whens.push({ expression: expression, action: action });
  };

  configure.then = function(expression, action) {
    thens.push({ expression: expression, action: action });
  };

  configure.beforeFeature = function(action) {
    before_features.push(action);
  };

  configure.afterFeature = function(action) {
    after_features.unshift(action);
  };

  configure.beforeScenario = function(action) {
    before_scenarios.push(action);
  };

  configure.afterScenario = function(action) {
    after_scenarios.unshift(action);
  };

  return configure;
}
