import { describe, it, expect } from "vitest";
import { InMemoryAppendOnlyStore } from "@event-engine/ports";
import { EventStore, type StoredEvent } from "@event-engine/store";
import {
  additive,
  distinct,
  rollup,
  MeasureRegistry,
  ExactDistinctSketch,
  evaluate,
  derived,
} from "../src/index";

describe("@event-engine/metrics public api", () => {
  it("aggregates captured events into a number through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.append({ name: "scored", occurredAt: "t1", payload: 10 });
    await store.append({ name: "scored", occurredAt: "t2", payload: 15 });

    const registry = new MeasureRegistry();
    registry.define(additive("points", (event) => event.payload as number));

    const measure = registry.get("points");
    expect(measure?.compute(await store.all())).toBe(25);
  });

  it("counts distinct entities from captured events through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.append({ name: "visit", occurredAt: "t1", payload: "u1" });
    await store.append({ name: "visit", occurredAt: "t2", payload: "u1" });
    await store.append({ name: "visit", occurredAt: "t3", payload: "u2" });
    const activeUsers = distinct("active_users", (event) => event.payload as string);
    expect(activeUsers.compute(await store.all())).toBe(2);
  });

  it("rolls a measure up by bucket from captured events through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.append({ name: "sale", occurredAt: "2026-01", payload: 10 });
    await store.append({ name: "sale", occurredAt: "2026-02", payload: 8 });
    await store.append({ name: "sale", occurredAt: "2026-01", payload: 5 });
    const revenue = additive("revenue", (event) => event.payload as number);
    const byMonth = rollup(
      await store.all(),
      (event) => event.occurredAt,
      revenue,
    );
    expect(byMonth).toEqual([
      { bucket: "2026-01", value: 15 },
      { bucket: "2026-02", value: 8 },
    ]);
  });

  it("merges per-segment distinct sketches into a global count through the package entry", () => {
    const us = new ExactDistinctSketch();
    us.add("u1");
    us.add("u2");
    const eu = new ExactDistinctSketch();
    eu.add("u2");
    eu.add("u3");
    expect(us.merge(eu).estimate()).toBe(3);
  });

  it("evaluates a derived-metric expression over measure values through the package entry", () => {
    expect(evaluate("revenue / orders", { revenue: 1000, orders: 8 })).toBe(125);
  });

  it("computes a derived metric from registered measures through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.append({ name: "order", occurredAt: "t1", payload: 100 });
    await store.append({ name: "order", occurredAt: "t2", payload: 60 });

    const registry = new MeasureRegistry();
    registry.define(additive("revenue", (event) => event.payload as number));
    registry.define(additive("orders", () => 1));

    const averageOrderValue = derived("aov", "revenue / orders", {
      revenue: registry.get("revenue")!,
      orders: registry.get("orders")!,
    });
    expect(averageOrderValue.compute(await store.all())).toBe(80);
  });
});
