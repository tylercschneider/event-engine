import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level } from "../src/event";

const InvoicePaid = defineEvent({
  name: "invoice.paid",
  version: 1,
  level: Level.Outbox,
  schema: z.object({ amountCents: z.number() }),
});

describe("Level", () => {
  it("ladders durability from inline to event-sourcing without a telemetry level", () => {
    const ladder = Object.values(Level).filter(
      (value) => typeof value === "number",
    );
    expect(ladder).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("defineEvent", () => {
  it("carries the event name into the built event", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.name).toBe("invoice.paid");
  });

  it("carries the validated payload into the built event", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.payload).toEqual({ amountCents: 100 });
  });

  it("carries the declared level into the built event", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.level).toBe(Level.Outbox);
  });

  it("carries occurredAt into the built event", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.occurredAt).toBe("2026-01-01T00:00:00Z");
  });

  it("carries the event version into the built event", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.version).toBe(1);
  });

  it("defaults the event type to the event name", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.type).toBe("invoice.paid");
  });

  it("defaults metadata to an empty object", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.metadata).toEqual({});
  });

  it("omits the idempotency key when none is provided", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.idempotencyKey).toBeUndefined();
  });

  it("resolves delivery capabilities from the level", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(event.capabilities).toEqual({
      backgrounded: true,
      durable: true,
      broker: false,
    });
  });

  it("generates a distinct event id for each build", () => {
    const first = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    const second = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(first.eventId).not.toBe(second.eventId);
  });

  it("carries provided idempotency key and aggregate fields from options", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z", {
      idempotencyKey: "idem-1",
      aggregateType: "Invoice",
      aggregateId: "inv-9",
      aggregateVersion: 3,
    });
    expect(event).toMatchObject({
      idempotencyKey: "idem-1",
      aggregateType: "Invoice",
      aggregateId: "inv-9",
      aggregateVersion: 3,
    });
  });

  it("freezes the built event payload", () => {
    const event = InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z");
    expect(Object.isFrozen(event.payload)).toBe(true);
  });

  it("exposes the event name on the definition", () => {
    expect(InvoicePaid.name).toBe("invoice.paid");
  });

  it("exposes a non-empty fingerprint on the definition", () => {
    expect(InvoicePaid.fingerprint.length).toBeGreaterThan(0);
  });

  it("exposes a non-empty shape on the definition", () => {
    expect(InvoicePaid.shape.length).toBeGreaterThan(0);
  });

  it("changes the fingerprint when the schema shape changes", () => {
    const withNumber = defineEvent({
      name: "thing.happened",
      version: 1,
      level: Level.InProcess,
      schema: z.object({ value: z.number() }),
    });
    const withString = defineEvent({
      name: "thing.happened",
      version: 1,
      level: Level.InProcess,
      schema: z.object({ value: z.string() }),
    });
    expect(withNumber.fingerprint).not.toBe(withString.fingerprint);
  });

  it("changes the fingerprint when the version changes", () => {
    const v1 = defineEvent({
      name: "thing.happened",
      version: 1,
      level: Level.InProcess,
      schema: z.object({ value: z.number() }),
    });
    const v2 = defineEvent({
      name: "thing.happened",
      version: 2,
      level: Level.InProcess,
      schema: z.object({ value: z.number() }),
    });
    expect(v1.fingerprint).not.toBe(v2.fingerprint);
  });
});
