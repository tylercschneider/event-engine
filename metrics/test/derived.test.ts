import { describe, it, expect } from "vitest";
import type { StoredEvent } from "@event-engine/store";
import { additive } from "../src/measure";
import { derived } from "../src/derived";

describe("derived", () => {
  it("computes an expression over its input measures", () => {
    const events: StoredEvent[] = [
      { name: "order", occurredAt: "t1", payload: 100 },
      { name: "order", occurredAt: "t2", payload: 60 },
    ];
    const revenue = additive("revenue", (event) => event.payload as number);
    const orders = additive("orders", () => 1);
    const averageOrderValue = derived("aov", "revenue / orders", {
      revenue,
      orders,
    });
    expect(averageOrderValue.compute(events)).toBe(80);
  });
});
