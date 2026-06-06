import { describe, it, expect } from "vitest";
import { InMemoryAppendOnlyStore } from "@event-engine/ports";
import { Level } from "@event-engine/core";
import { EventStore, type StoredEvent } from "../src/event-store";

function dispatched(name: string): StoredEvent & { level: Level } {
  return { name, level: Level.Outbox, payload: 1, occurredAt: "t" };
}

describe("EventStore recording", () => {
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

  it("records a dispatched event through the recorder handler", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.recorder()(dispatched("invoice.paid"));
    expect((await store.all()).map((event) => event.name)).toEqual([
      "invoice.paid",
    ]);
  });

  it("records the event version", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.recorder()({
      name: "invoice.paid",
      level: Level.Outbox,
      payload: 1,
      occurredAt: "t",
      version: 2,
    });
    expect((await store.all())[0]?.version).toBe(2);
  });

  it("records the event level", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.recorder()({
      name: "invoice.paid",
      level: Level.Outbox,
      payload: 1,
      occurredAt: "t",
    });
    expect((await store.all())[0]?.level).toBe(Level.Outbox);
  });

  it("records the event type", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.recorder()({
      name: "invoice.paid",
      type: "billing",
      level: Level.Outbox,
      payload: 1,
      occurredAt: "t",
    });
    expect((await store.all())[0]?.type).toBe("billing");
  });
});

describe("EventStore projections", () => {
  it("delivers a dispatched event to a subscribed projection", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const seen: string[] = [];
    store.subscribe((event) => {
      seen.push(event.name);
    });
    await store.projectionDispatcher()(dispatched("a"));
    expect(seen).toEqual(["a"]);
  });

  it("awaits an async projection in the dispatcher", async () => {
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
    await store.projectionDispatcher()(dispatched("a"));
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
    await store.projectionDispatcher()(dispatched("a"));
    expect(errors).toEqual([boom]);
  });

  it("delivers to later projections even when an earlier one throws", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const seen: string[] = [];
    store.subscribe(() => {
      throw new Error("boom");
    });
    store.subscribe((event) => {
      seen.push(event.name);
    });
    await store.projectionDispatcher()(dispatched("a"));
    expect(seen).toEqual(["a"]);
  });
});

describe("EventStore replay", () => {
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
