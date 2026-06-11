import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, EventEngine } from "@eventengine/core";
import { InMemoryAppendOnlyStore } from "@eventengine/ports";
import { EventStore, type StoredEvent } from "../src/index";

describe("@eventengine/store public api", () => {
  it("captures a defined event and reads it back through the package entry", async () => {
    const InvoicePaid = defineEvent({
      name: "invoice.paid",
      version: 1,
      processType: "durable",
      schema: z.object({ amountCents: z.number() }),
    });
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    await store.append(InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z"));
    const recorded = await store.all();
    expect(recorded[0]?.name).toBe("invoice.paid");
  });

  it("records and projects an emitted event through the EventEngine", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const engine = new EventEngine();
    engine.registerHandler(store.recorder(), "all");
    engine.registerHandler(store.projectionDispatcher(), "all");

    const projected: string[] = [];
    store.subscribe((event) => {
      projected.push(event.name);
    });

    const InvoicePaid = defineEvent({
      name: "invoice.paid",
      version: 1,
      processType: "durable",
      schema: z.object({ amountCents: z.number() }),
    });
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z");

    expect({
      recorded: (await store.all()).map((event) => event.name),
      projected,
    }).toEqual({ recorded: ["invoice.paid"], projected: ["invoice.paid"] });
  });

  it("records the full event envelope through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<StoredEvent>();
    const store = new EventStore(log);
    const engine = new EventEngine();
    engine.registerHandler(store.recorder(), "all");
    const InvoicePaid = defineEvent({
      name: "invoice.paid",
      version: 2,
      processType: "durable",
      schema: z.object({ amountCents: z.number() }),
    });
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z", {
      idempotencyKey: "idem-1",
      aggregateType: "Invoice",
      aggregateId: "inv-9",
      aggregateVersion: 3,
    });
    expect((await store.all())[0]).toMatchObject({
      name: "invoice.paid",
      version: 2,
      payload: { amountCents: 100 },
      idempotencyKey: "idem-1",
      aggregateType: "Invoice",
      aggregateId: "inv-9",
      aggregateVersion: 3,
    });
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
