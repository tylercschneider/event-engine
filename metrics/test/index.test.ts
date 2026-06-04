import { describe, it, expect } from "vitest";
import { InMemoryAppendOnlyStore } from "@stats/ports";
import { EventStore, type StoredEvent } from "@stats/store";
import { additive, MeasureRegistry } from "../src/index";

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
});
