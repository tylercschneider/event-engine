import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level } from "../src/event";
import { EventRegistry } from "../src/registry";

const InvoicePaid = defineEvent({
  name: "invoice.paid",
  version: 1,
  level: Level.Outbox,
  schema: z.object({ amountCents: z.number() }),
});

describe("EventRegistry", () => {
  it("lists a registered definition in the catalog", () => {
    const registry = new EventRegistry();
    registry.register(InvoicePaid);
    expect(registry.catalog()).toContain(InvoicePaid);
  });
});
