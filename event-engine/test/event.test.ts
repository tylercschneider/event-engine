import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level } from "../src/event";

const InvoicePaid = defineEvent({
  name: "invoice.paid",
  version: 1,
  level: Level.Outbox,
  schema: z.object({ amountCents: z.number() }),
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
});
