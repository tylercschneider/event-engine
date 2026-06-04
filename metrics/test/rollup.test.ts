import { describe, it, expect } from "vitest";
import type { StoredEvent } from "@stats/store";
import { additive } from "../src/measure";
import { rollup } from "../src/rollup";

describe("rollup", () => {
  it("aggregates all events in a single bucket", () => {
    const events: StoredEvent[] = [
      { name: "sale", occurredAt: "2026-01", payload: 10 },
      { name: "sale", occurredAt: "2026-01", payload: 5 },
    ];
    const revenue = additive("revenue", (event) => event.payload as number);
    expect(rollup(events, (event) => event.occurredAt, revenue)).toEqual([
      { bucket: "2026-01", value: 15 },
    ]);
  });
});
