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
  const groups = new Map<string, StoredEvent[]>();
  for (const event of events) {
    const bucket = bucketOf(event);
    const group = groups.get(bucket) ?? [];
    group.push(event);
    groups.set(bucket, group);
  }
  return [...groups].map(([bucket, group]) => ({
    bucket,
    value: measure.compute(group),
  }));
}
