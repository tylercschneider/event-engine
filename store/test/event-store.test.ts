import { describe, it, expect } from "vitest";
import { InMemoryAppendOnlyStore } from "@event-engine/ports";
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

  it("returns events beyond a single page", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    for (let i = 0; i < 250; i++) {
      await store.append({ name: "tick", occurredAt: "t", payload: i });
    }
    expect(await store.all()).toHaveLength(250);
  });

  it("delivers an appended event to a subscribed projection", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const seen: StoredEvent[] = [];
    store.subscribe((event) => {
      seen.push(event);
    });
    const event: StoredEvent = { name: "a", occurredAt: "t", payload: 1 };
    await store.append(event);
    expect(seen).toEqual([event]);
  });

  it("awaits an async projection before append resolves", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    let done = false;
    store.subscribe(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            done = true;
            resolve();
          }, 5);
        }),
    );
    await store.append({ name: "a", occurredAt: "t", payload: 1 });
    expect(done).toBe(true);
  });

  it("routes a projection error to the error handler", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const errors: unknown[] = [];
    const store = new EventStore(log, (error) => {
      errors.push(error);
    });
    const boom = new Error("boom");
    store.subscribe(() => {
      throw boom;
    });
    await store.append({ name: "x", occurredAt: "t", payload: 1 });
    expect(errors).toEqual([boom]);
  });

  it("replays every recorded event through a projection in order", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const first: StoredEvent = { name: "a", occurredAt: "t1", payload: 1 };
    const second: StoredEvent = { name: "b", occurredAt: "t2", payload: 2 };
    await store.append(first);
    await store.append(second);
    const seen: StoredEvent[] = [];
    await store.replay((event) => {
      seen.push(event);
    });
    expect(seen).toEqual([first, second]);
  });

  it("awaits an async projection during replay", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.append({ name: "a", occurredAt: "t", payload: 1 });
    let done = false;
    await store.replay(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            done = true;
            resolve();
          }, 5);
        }),
    );
    expect(done).toBe(true);
  });
});
