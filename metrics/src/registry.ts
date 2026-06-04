import type { Measure } from "./measure";

export class DuplicateMeasureError extends Error {
  constructor(key: string) {
    super(`a measure with key "${key}" is already defined`);
    this.name = "DuplicateMeasureError";
  }
}

export class MeasureRegistry {
  private readonly byKey = new Map<string, Measure>();

  define(measure: Measure): void {
    if (this.byKey.has(measure.key)) {
      throw new DuplicateMeasureError(measure.key);
    }
    this.byKey.set(measure.key, measure);
  }

  get(key: string): Measure | null {
    return this.byKey.get(key) ?? null;
  }
}
