import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level } from "@event-engine/core";
import { InMemoryAppendOnlyStore } from "@event-engine/ports";
import {
  EventStore,
  type StoredEvent,
  type Projection,
  type ProjectionErrorHandler,
} from "../src/index";

describe("@event-engine/store public api", () => {
  it("captures a defined event and reads it back through the package entry", async () => {
    const InvoicePaid = defineEvent({
      name: "invoice.paid",
      version: 1,
      level: Level.Outbox,
      schema: z.object({ amountCents: z.number() }),
    });
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    await store.append(event);
    const recorded = await store.all();
    expect(recorded[0]?.name).toBe("invoice.paid");
  });

  it("delivers captured events to a projection through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const names: string[] = [];
    const projection: Projection = (event) => {
      names.push(event.name);
    };
    store.subscribe(projection);
    await store.append({ name: "user.signup", occurredAt: "t", payload: {} });
    expect(names).toEqual(["user.signup"]);
  });

  it("rebuilds projection state by replaying recorded events through the entry", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.append({ name: "scored", occurredAt: "t1", payload: 3 });
    await store.append({ name: "scored", occurredAt: "t2", payload: 4 });
    let total = 0;
    await store.replay((event) => {
      total += event.payload as number;
    });
    expect(total).toBe(7);
  });

  it("isolates a failing projection so the rest still run, through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const errors: unknown[] = [];
    const onError: ProjectionErrorHandler = (error) => {
      errors.push(error);
    };
    const store = new EventStore(log, onError);
    const seen: string[] = [];
    store.subscribe(() => {
      throw new Error("boom");
    });
    store.subscribe((event) => {
      seen.push(event.name);
    });
    await store.append({ name: "user.signup", occurredAt: "t", payload: {} });
    expect(seen).toEqual(["user.signup"]);
  });
});
