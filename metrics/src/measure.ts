import type { StoredEvent } from "@stats/store";

export type MeasureKind = "additive" | "semi_additive" | "holistic" | "cohort";

export interface Measure {
  key: string;
  kind: MeasureKind;
  compute(events: StoredEvent[]): number;
}

export function additive(
  key: string,
  valueOf: (event: StoredEvent) => number,
): Measure {
  return {
    key,
    kind: "additive",
    compute(events) {
      return events.reduce((sum, event) => sum + valueOf(event), 0);
    },
  };
}
