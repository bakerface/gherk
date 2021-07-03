export interface Feature {
  readonly name: string;
  readonly description: string;
  readonly backgrounds: Background[];
  readonly scenarios: Scenario[];
}

export interface Background {
  readonly name: string;
  readonly description: string;
  readonly givens: string[];
}

export interface Scenario {
  readonly name: string;
  readonly description: string;
  readonly givens: string[];
  readonly whens: string[];
  readonly thens: string[];
}
