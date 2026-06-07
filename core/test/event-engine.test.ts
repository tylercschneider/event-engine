import { describe, it, expect } from "vitest";
import { z } from "zod";
import { EventEngine } from "../src/event-engine";
import { defineEvent, Level } from "../src/event";

const InvoicePaid = defineEvent({
  name: "invoice.paid",
  version: 1,
  level: Level.Outbox,
  schema: z.object({ amountCents: z.number() }),
});

describe("EventEngine", () => {
  it("emits a defined event to registered handlers", async () => {
    const engine = new EventEngine();
    const seen: string[] = [];
    engine.registerHandler((event) => {
      seen.push(event.name);
    }, "all");
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(seen).toEqual(["invoice.paid"]);
  });

  it("dispatches the event id to handlers", async () => {
    const engine = new EventEngine();
    let received: string | undefined;
    engine.registerHandler((event) => {
      received = event.eventId;
    }, "all");
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(received?.length).toBeGreaterThan(0);
  });

  it("dispatches the event version to handlers", async () => {
    const engine = new EventEngine();
    let received: number | undefined;
    engine.registerHandler((event) => {
      received = event.version;
    }, "all");
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(received).toBe(1);
  });

  it("dispatches the idempotency key to handlers", async () => {
    const engine = new EventEngine();
    let received: string | undefined;
    engine.registerHandler((event) => {
      received = event.idempotencyKey;
    }, "all");
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z", {
      idempotencyKey: "idem-1",
    });
    expect(received).toBe("idem-1");
  });

  it("dispatches the aggregate identity to handlers", async () => {
    const engine = new EventEngine();
    let received: Record<string, unknown> = {};
    engine.registerHandler((event) => {
      received = {
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        aggregateVersion: event.aggregateVersion,
      };
    }, "all");
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z", {
      aggregateType: "Invoice",
      aggregateId: "inv-9",
      aggregateVersion: 3,
    });
    expect(received).toEqual({
      aggregateType: "Invoice",
      aggregateId: "inv-9",
      aggregateVersion: 3,
    });
  });

  it("dispatches the event metadata to handlers", async () => {
    const engine = new EventEngine();
    let received: Record<string, unknown> | undefined;
    engine.registerHandler((event) => {
      received = event.metadata;
    }, "all");
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z", {
      metadata: { source: "web" },
    });
    expect(received).toEqual({ source: "web" });
  });

  it("dispatches the event type to handlers", async () => {
    const engine = new EventEngine();
    let received: string | undefined;
    engine.registerHandler((event) => {
      received = event.type;
    }, "all");
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(received).toBe("invoice.paid");
  });

  it("fires an emitted notification carrying the built event", async () => {
    const engine = new EventEngine();
    const observed: string[] = [];
    engine.notifications.on("emitted", (event) => {
      observed.push(event.name);
    });
    await engine.emit(InvoicePaid, { amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(observed).toEqual(["invoice.paid"]);
  });
});
