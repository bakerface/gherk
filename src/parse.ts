export interface Feature {
  readonly name: string;
  readonly description: string;
  readonly backgrounds: readonly Background[];
  readonly scenarios: readonly Scenario[];
}

export interface Background {
  readonly name: string;
  readonly description: string;
  readonly givens: readonly string[];
}

export interface Scenario {
  readonly name: string;
  readonly description: string;
  readonly backgrounds: readonly string[];
  readonly givens: readonly string[];
  readonly whens: readonly string[];
  readonly thens: readonly string[];
}

export interface Parser {
  feature(text: string): Parser;
  description(text: string): Parser;
  scenario(text: string): Parser;
  background(text: string): Parser;
  given(text: string): Parser;
  when(text: string): Parser;
  then(text: string): Parser;
  and(text: string): Parser;
  but(text: string): Parser;
  end(): readonly Feature[];
}

export function parse(document: Buffer | string): readonly Feature[] {
  let parser = parseDocument([]);

  for (const line of document.toString().split(/\r?\n/g)) {
    const description = line.trim();
    const feature = extract(line, "Feature:");
    const scenario = extract(line, "Scenario:");
    const background = extract(line, "Background:");
    const given = extract(line, "Given ");
    const when = extract(line, "When ");
    const then = extract(line, "Then ");
    const and = extract(line, "And ");
    const but = extract(line, "But ");

    if (feature) {
      parser = parser.feature(feature.text);
    } else if (scenario) {
      parser = parser.scenario(scenario.text);
    } else if (background) {
      parser = parser.background(background.text);
    } else if (given) {
      parser = parser.given(given.text);
    } else if (when) {
      parser = parser.when(when.text);
    } else if (then) {
      parser = parser.then(then.text);
    } else if (and) {
      parser = parser.and(and.text);
    } else if (but) {
      parser = parser.but(but.text);
    } else if (description) {
      parser = parser.description(description);
    }
  }

  return parser.end();
}

function extract(line: string, first: string) {
  const trimmed = line.trim();

  if (!trimmed.startsWith(first)) {
    return null;
  }

  const offset = line.indexOf(first);
  const text = line.slice(offset + first.length).trim();

  return { offset, text };
}

function parseDocument(features: readonly Feature[]): Parser {
  return {
    feature: (name) =>
      parseFeature(features, {
        name,
        description: "",
        backgrounds: [],
        scenarios: [],
      }),
    description: () => parseDocument(features),
    scenario: () => parseDocument(features),
    background: () => parseDocument(features),
    given: () => parseDocument(features),
    when: () => parseDocument(features),
    then: () => parseDocument(features),
    and: () => parseDocument(features),
    but: () => parseDocument(features),
    end: () => features,
  };
}

function parseFeature(features: readonly Feature[], feature: Feature): Parser {
  return {
    feature: (name) => {
      return parseFeature(features.concat(feature), {
        name,
        description: "",
        backgrounds: [],
        scenarios: [],
      });
    },
    description: (text) =>
      parseFeature(features, {
        ...feature,
        description: (feature.description + " " + text).trim(),
      }),
    scenario: (name) =>
      parseScenario(features, feature, {
        name,
        description: "",
        backgrounds: [],
        givens: [],
        whens: [],
        thens: [],
      }),
    background: (name) =>
      parseBackground(features, feature, {
        name,
        description: "",
        givens: [],
      }),
    given: () => parseFeature(features, feature),
    when: () => parseFeature(features, feature),
    then: () => parseFeature(features, feature),
    and: () => parseFeature(features, feature),
    but: () => parseFeature(features, feature),
    end: () => features.concat(feature),
  };
}

function parseBackground(
  features: readonly Feature[],
  feature: Feature,
  background: Background
): Parser {
  return {
    feature: (name) => {
      return parseFeature(
        features.concat({
          ...feature,
          backgrounds: feature.backgrounds.concat(background),
        }),
        {
          name,
          description: "",
          backgrounds: [],
          scenarios: [],
        }
      );
    },
    description: (text) =>
      parseBackground(features, feature, {
        ...background,
        description: (background.description + " " + text).trim(),
      }),
    scenario: (name) =>
      parseScenario(
        features,
        {
          ...feature,
          backgrounds: feature.backgrounds.concat(background),
        },
        {
          name,
          description: "",
          backgrounds: [],
          givens: [],
          whens: [],
          thens: [],
        }
      ),
    background: (name) =>
      parseBackground(
        features,
        {
          ...feature,
          backgrounds: feature.backgrounds.concat(background),
        },
        {
          name,
          description: "",
          givens: [],
        }
      ),
    given: (text) =>
      parseBackground(features, feature, {
        ...background,
        givens: background.givens.concat(text),
      }),
    and: (text) =>
      parseBackground(features, feature, {
        ...background,
        givens: background.givens.concat(text),
      }),
    when: () => parseBackground(features, feature, background),
    then: () => parseBackground(features, feature, background),
    but: () => parseBackground(features, feature, background),
    end: () =>
      features.concat({
        ...feature,
        backgrounds: feature.backgrounds.concat(background),
      }),
  };
}

function parseScenario(
  features: readonly Feature[],
  feature: Feature,
  scenario: Scenario
): Parser {
  return {
    feature: (name) => {
      return parseFeature(
        features.concat({
          ...feature,
          scenarios: feature.scenarios.concat(scenario),
        }),
        {
          name,
          description: "",
          backgrounds: [],
          scenarios: [],
        }
      );
    },
    description: (text) =>
      parseScenario(features, feature, {
        ...scenario,
        description: (scenario.description + " " + text).trim(),
      }),
    scenario: (name) =>
      parseScenario(
        features,
        {
          ...feature,
          scenarios: feature.scenarios.concat(scenario),
        },
        {
          name,
          description: "",
          backgrounds: [],
          givens: [],
          whens: [],
          thens: [],
        }
      ),
    background: (text) =>
      parseScenario(features, feature, {
        ...scenario,
        backgrounds: scenario.backgrounds.concat(text),
      }),
    given: (text) =>
      parseGiven(features, feature, {
        ...scenario,
        givens: scenario.givens.concat(text),
      }),
    when: (text) =>
      parseWhen(features, feature, {
        ...scenario,
        whens: scenario.whens.concat(text),
      }),
    then: (text) =>
      parseThen(features, feature, {
        ...scenario,
        thens: scenario.thens.concat(text),
      }),
    and: () => parseScenario(features, feature, scenario),
    but: () => parseScenario(features, feature, scenario),
    end: () =>
      features.concat({
        ...feature,
        scenarios: feature.scenarios.concat(scenario),
      }),
  };
}

function parseGiven(
  features: readonly Feature[],
  feature: Feature,
  scenario: Scenario
): Parser {
  return {
    ...parseScenario(features, feature, scenario),
    and: (text) => parseScenario(features, feature, scenario).given(text),
    but: (text) => parseScenario(features, feature, scenario).given(text),
  };
}

function parseWhen(
  features: readonly Feature[],
  feature: Feature,
  scenario: Scenario
): Parser {
  return {
    ...parseScenario(features, feature, scenario),
    and: (text) => parseScenario(features, feature, scenario).when(text),
    but: (text) => parseScenario(features, feature, scenario).when(text),
  };
}

function parseThen(
  features: readonly Feature[],
  feature: Feature,
  scenario: Scenario
): Parser {
  return {
    ...parseScenario(features, feature, scenario),
    and: (text) => parseScenario(features, feature, scenario).then(text),
    but: (text) => parseScenario(features, feature, scenario).then(text),
  };
}
