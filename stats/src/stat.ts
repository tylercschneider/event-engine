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

export function resolveInputs(
  stat: Stat,
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const input of Object.values(stat.inputs)) {
    const value = raw[input.key];
    if (value === undefined) continue;
    resolved[input.key] = value;
  }
  return resolved;
}
