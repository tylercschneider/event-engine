import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level } from "@stats/event-engine";
import { InMemoryAppendOnlyStore } from "@stats/ports";
import { EventStore, type StoredEvent, type Projection } from "../src/index";

describe("@stats/store public api", () => {
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
});
