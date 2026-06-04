import { describe, it, expect } from "vitest";
import { InMemoryAppendOnlyStore } from "@stats/ports";
import { EventStore, type StoredEvent } from "../src/event-store";

describe("EventStore", () => {
  it("returns appended events in order", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const first: StoredEvent = { name: "a", occurredAt: "t1", payload: 1 };
    const second: StoredEvent = { name: "b", occurredAt: "t2", payload: 2 };
    await store.append(first);
    await store.append(second);
    expect(await store.all()).toEqual([first, second]);
  });
});
