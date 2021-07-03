export type TokenOf<Parsers> = Parsers extends TokenParsers<infer Type>
  ? Token<Type>
  : Token<string>;

export type TokenParsers<Type extends string> = Record<Type, RegExp>;

export interface Token<Type extends string> {
  readonly type: Type;
  readonly value: string;
  readonly matches: string[];
}

export function tokenize<Type extends string>(
  text: string,
  parsers: TokenParsers<Type>
): Token<Type>[] {
  const tokens: Token<Type>[] = [];

  while (text) {
    let offset = text.length;
    let token: Token<Type> | undefined;

    for (const type in parsers) {
      const match = parsers[type].exec(text);

      if (match && match.index < offset) {
        const [value, ...matches] = match;
        offset = match.index;
        token = { type, value, matches };
      }
    }

    if (offset || !token) {
      throw new Error(`Unable to tokenize "${text.slice(0, offset)}".`);
    }

    tokens.push(token);
    text = text.slice(token.value.length);
  }

  return tokens;
}
