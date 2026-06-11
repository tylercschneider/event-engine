import type { StoredEvent } from "@eventengine/store";

export type MeasureKind =
  | "additive"
  | "semi_additive"
  | "holistic"
  | "cohort"
  | "derived";

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

export function distinct(
  key: string,
  keyOf: (event: StoredEvent) => string,
): Measure {
  return {
    key,
    kind: "holistic",
    compute(events) {
      return new Set(events.map(keyOf)).size;
    },
  };
}

export function latest(
  key: string,
  valueOf: (event: StoredEvent) => number,
): Measure {
  return {
    key,
    kind: "semi_additive",
    compute(events) {
      if (events.length === 0) return 0;
      const newest = events.reduce((a, b) =>
        a.occurredAt >= b.occurredAt ? a : b,
      );
      return valueOf(newest);
    },
  };
}
