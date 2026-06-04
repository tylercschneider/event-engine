import type { Measure } from "./measure";

export class MeasureRegistry {
  private readonly byKey = new Map<string, Measure>();

  define(measure: Measure): void {
    this.byKey.set(measure.key, measure);
  }

  get(key: string): Measure | null {
    return this.byKey.get(key) ?? null;
  }
}
