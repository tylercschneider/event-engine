import { describe, it, expect } from "vitest";
import { InMemoryAppendOnlyStore } from "@stats/ports";
import { EventStore, type StoredEvent } from "@stats/store";
import { additive, distinct, MeasureRegistry } from "../src/index";

describe("@stats/metrics public api", () => {
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
});
