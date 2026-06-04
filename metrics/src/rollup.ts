import type { StoredEvent } from "@stats/store";
import type { Measure } from "./measure";

export interface RollupEntry {
  bucket: string;
  value: number;
}

export function rollup(
  events: StoredEvent[],
  bucketOf: (event: StoredEvent) => string,
  measure: Measure,
): RollupEntry[] {
  const first = events[0];
  if (!first) return [];
  return [{ bucket: bucketOf(first), value: measure.compute(events) }];
}
