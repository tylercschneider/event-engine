export interface StatInput<T = unknown> {
  key: string;
  required: boolean;
  validate: (value: unknown) => value is T;
}

export type Unit = "count" | "currency" | "percent" | "duration_ms" | "ratio";

export type Timeframe = "all_time" | "ytd" | "mtd" | "last_30d" | "custom";

export interface Stat<
  Inputs extends Record<string, StatInput> = Record<string, StatInput>,
> {
  key: string;
  title: string;
  definition: string;
  unit: Unit;
  timeframe: Timeframe;
  inputs: Inputs;
}

export class MissingInputError extends Error {
  constructor(key: string) {
    super(`required input "${key}" is missing`);
    this.name = "MissingInputError";
  }
}

export class InvalidInputError extends Error {
  constructor(key: string) {
    super(`input "${key}" failed validation`);
    this.name = "InvalidInputError";
  }
}

export function resolveInputs(
  stat: Stat,
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const input of Object.values(stat.inputs)) {
    const value = raw[input.key];
    if (value === undefined) {
      if (input.required) throw new MissingInputError(input.key);
      continue;
    }
    if (!input.validate(value)) throw new InvalidInputError(input.key);
    resolved[input.key] = value;
  }
  return resolved;
}
