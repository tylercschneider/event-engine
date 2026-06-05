export class UnknownVariableError extends Error {
  constructor(name: string) {
    super(`unknown variable "${name}"`);
    this.name = "UnknownVariableError";
  }
}

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
    while (this.peek() === "+" || this.peek() === "-") {
      const operator = this.next();
      const term = this.parseTerm();
      value = operator === "+" ? value + term : value - term;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    while (this.peek() === "*" || this.peek() === "/") {
      const operator = this.next();
      const factor = this.parseFactor();
      value = operator === "*" ? value * factor : value / factor;
    }
    return value;
  }

  private parseFactor(): number {
    const token = this.next();
    if (token === undefined) throw new Error("unexpected end of expression");
    if (token === "(") {
      const value = this.parseExpression();
      this.next();
      return value;
    }
    if (token in this.variables) return this.variables[token]!;
    const value = Number(token);
    if (Number.isNaN(value)) throw new UnknownVariableError(token);
    return value;
  }
}

export function evaluate(
  expression: string,
  variables: Record<string, number> = {},
): number {
  return new Parser(tokenize(expression), variables).parseExpression();
}
