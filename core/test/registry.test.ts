import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent } from "../src/event";
import { EventRegistry, SchemaDriftError } from "../src/registry";

const InvoicePaid = defineEvent({
  name: "invoice.paid",
  version: 1,
  processType: "durable",
  schema: z.object({ amountCents: z.number() }),
});

describe("EventRegistry", () => {
  it("lists a registered definition in the catalog", () => {
    const registry = new EventRegistry();
    registry.register(InvoicePaid);
    expect(registry.catalog()).toContain(InvoicePaid);
  });

  it("keeps one catalog entry per event name", () => {
    const registry = new EventRegistry();
    registry.register(InvoicePaid);
    registry.register(InvoicePaid);
    expect(registry.catalog()).toHaveLength(1);
  });

  it("rejects re-registering an event whose shape changed", () => {
    const registry = new EventRegistry();
    const original = defineEvent({
      name: "report.run",
      version: 1,
      processType: "inline",
      schema: z.object({ rows: z.number() }),
    });
    const drifted = defineEvent({
      name: "report.run",
      version: 1,
      processType: "inline",
      schema: z.object({ rows: z.string() }),
    });
    registry.register(original);
    expect(() => registry.register(drifted)).toThrow(SchemaDriftError);
  });
});
