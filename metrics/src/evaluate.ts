export function evaluate(
  expression: string,
  variables: Record<string, number> = {},
): number {
  const token = expression.trim();
  return token in variables ? variables[token]! : Number(token);
}
