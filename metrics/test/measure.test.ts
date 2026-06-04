import { describe, it, expect } from "vitest";
import type { StoredEvent } from "@stats/store";
import { additive } from "../src/measure";

describe("additive", () => {
  it("sums the extracted value over events", () => {
    const events: StoredEvent[] = [
      { name: "scored", occurredAt: "t1", payload: 3 },
      { name: "scored", occurredAt: "t2", payload: 4 },
    ];
    const points = additive("points", (event) => event.payload as number);
    expect(points.compute(events)).toBe(7);
  });
});
