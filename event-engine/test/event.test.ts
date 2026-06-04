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
});
