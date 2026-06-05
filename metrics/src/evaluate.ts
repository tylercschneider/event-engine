type Token = string;

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < expression.length) {
    const char = expression[index]!;
    if (char === " ") {
      index++;
      continue;
    }
    if ("+-*/()".includes(char)) {
      tokens.push(char);
      index++;
      continue;
    }
    let end = index;
    while (end < expression.length && !" +-*/()".includes(expression[end]!)) {
      end++;
    }
    tokens.push(expression.slice(index, end));
    index = end;
  }
  return tokens;
}

class Parser {
  private position = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly variables: Record<string, number>,
  ) {}

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private next(): Token | undefined {
    return this.tokens[this.position++];
  }

  parseExpression(): number {
    let value = this.parseTerm();
    while (this.peek() === "+") {
      this.next();
      value += this.parseTerm();
    }
    return value;
  }

  private parseTerm(): number {
    return this.parseFactor();
  }

  private parseFactor(): number {
    const token = this.next();
    if (token === undefined) throw new Error("unexpected end of expression");
    if (token in this.variables) return this.variables[token]!;
    return Number(token);
  }
}

export function evaluate(
  expression: string,
  variables: Record<string, number> = {},
): number {
  return new Parser(tokenize(expression), variables).parseExpression();
}
