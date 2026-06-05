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
