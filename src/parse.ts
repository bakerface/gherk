import { TokenOf, tokenize } from "./tokenize";
import { Background, Feature, Scenario } from "./types";

export type Token = TokenOf<typeof parsers>;

const parsers = {
  space: /[\t ]+/,
  newline: /\r?\n/,
  colon: /:/,
  tag: /@/,
  feature: /Feature/,
  scenario: /Scenario/,
  background: /Background/,
  given: /Given/,
  when: /When/,
  then: /Then/,
  and: /And/,
  but: /But/,
  word: /\w+/,
  punctuation: /./,
};

export function parse(text: string): Feature[] {
  return document(tokenize(text, parsers));
}

export class ParseError extends Error {
  constructor(token: Token | undefined, message: string) {
    super();

    if (token) {
      const json = JSON.stringify(token.value);
      this.message = `${message}, but found ${token.type} ${json}`;
    } else {
      this.message = message;
    }
  }
}

function document(tokens: Token[]): Feature[] {
  const tags: string[] = [];
  const features: Feature[] = [];

  let token: Token | undefined;

  while ((token = tokens.shift())) {
    if (token.type === "newline") continue;
    if (token.type === "space") continue;

    if (token.type === "tag") {
      if (!(token = tokens.shift()) || token.type !== "word") {
        throw new ParseError(token, "Expected a tag");
      }

      tags.push(token.value);
      continue;
    }

    if (token.type !== "feature") {
      throw new ParseError(token, "Expected feature");
    }

    features.push(feature(tokens, tags.splice(0)));
  }

  return features;
}

function feature(tokens: Token[], tags: string[]): Feature {
  let token: Token | undefined;

  if (!(token = tokens.shift()) || token.type !== "colon") {
    throw new ParseError(token, "Expected a colon after the feature keyword");
  }

  const name = line(tokens);
  const description: string[] = [];
  const backgrounds: Background[] = [];
  const scenarios: Scenario[] = [];

  while ((token = tokens.shift())) {
    if (token.type === "newline") continue;
    if (token.type === "space") continue;

    if (token.type === "word") {
      description.push(token.value);
      description.push(line(tokens));
      continue;
    }

    if (token.type === "background") {
      backgrounds.push(background(tokens));
      continue;
    }

    if (token.type === "scenario") {
      scenarios.push(scenario(tokens));
      continue;
    }

    if (token.type === "feature") {
      tokens.unshift(token);
      break;
    }

    throw new ParseError(token, "Expected background or scenario");
  }

  return {
    name,
    description: description.join(" "),
    tags,
    scenarios,
    backgrounds,
  };
}

function background(tokens: Token[]): Background {
  let token: Token | undefined;

  if (!(token = tokens.shift()) || token.type !== "colon") {
    throw new ParseError(
      token,
      "Expected a colon after the background keyword"
    );
  }

  const name = line(tokens);
  const description: string[] = [];
  const givens: string[] = [];

  while ((token = tokens.shift())) {
    if (token.type === "newline") continue;
    if (token.type === "space") continue;

    if (token.type === "word") {
      description.push(token.value);
      description.push(line(tokens));
      continue;
    }

    if (token.type === "given" || token.type === "and") {
      givens.push(line(tokens));
      continue;
    }

    if (token.type === "feature" || token.type === "scenario") {
      tokens.unshift(token);
      break;
    }

    throw new ParseError(token, "Expected given");
  }

  return {
    name,
    description: description.join(" "),
    givens,
  };
}

function scenario(tokens: Token[]): Scenario {
  let token: Token | undefined;

  if (!(token = tokens.shift()) || token.type !== "colon") {
    throw new ParseError(token, "Expected a colon after the scenario keyword");
  }

  const name = line(tokens);
  const description: string[] = [];
  const givens: string[] = [];
  const whens: string[] = [];
  const thens: string[] = [];

  let group: string[] | undefined;

  while ((token = tokens.shift())) {
    if (token.type === "newline") continue;
    if (token.type === "space") continue;

    if (token.type === "word") {
      description.push(token.value);
      description.push(line(tokens));
      continue;
    }

    if (token.type === "given") {
      givens.push(line(tokens));
      group = givens;
      continue;
    }

    if (token.type === "when") {
      whens.push(line(tokens));
      group = whens;
      continue;
    }

    if (token.type === "then") {
      thens.push(line(tokens));
      group = thens;
      continue;
    }

    if (token.type === "and" || token.type === "but") {
      if (!group) {
        throw new ParseError(token, "Expected a given, when, or then");
      }

      group.push(line(tokens));
      continue;
    }

    if (token.type === "feature" || token.type === "scenario") {
      tokens.unshift(token);
      break;
    }

    throw new ParseError(token, "Expected a given, when, or then");
  }

  return {
    name,
    description: description.join(" "),
    givens,
    whens,
    thens,
  };
}

function line(tokens: Token[]): string {
  let token: Token | undefined;
  let line = "";

  while ((token = tokens.shift())) {
    if (token.type === "newline") {
      break;
    }

    line += token.value;
  }

  return line.trim();
}
