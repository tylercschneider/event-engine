import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level } from "@event-engine/core";
import {
  InMemoryAppendOnlyStore,
  InlineJobQueue,
  InMemoryTransactionManager,
} from "@event-engine/ports";
import {
  Outbox,
  levelRouter,
  type OutboxEvent,
  type Transport,
} from "../src/index";

describe("@event-engine/delivery public api", () => {
  it("emits a defined event and delivers it through a transport via the package entry", async () => {
    const InvoicePaid = defineEvent({
      name: "invoice.paid",
      version: 1,
      level: Level.Outbox,
      schema: z.object({ amountCents: z.number() }),
    });
    const log = new InMemoryAppendOnlyStore<OutboxEvent>();
    const jobs = new InlineJobQueue();
    const transactions = new InMemoryTransactionManager();
    const delivered: string[] = [];
    const outbox = new Outbox(log, jobs, transactions, (event) => {
      delivered.push(event.name);
    });
    await outbox.emit(InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z"));
    expect(delivered).toEqual(["invoice.paid"]);
  });

  it("routes an emitted event to the transport for its level through the package entry", async () => {
    const InvoicePaid = defineEvent({
      name: "invoice.paid",
      version: 1,
      level: Level.Outbox,
      schema: z.object({ amountCents: z.number() }),
    });
    const log = new InMemoryAppendOnlyStore<OutboxEvent>();
    const jobs = new InlineJobQueue();
    const transactions = new InMemoryTransactionManager();
    const delivered: string[] = [];
    const routes = new Map<Level, Transport>([
      [
        Level.Outbox,
        (event) => {
          delivered.push(event.name);
        },
      ],
    ]);
    const outbox = new Outbox(log, jobs, transactions, levelRouter(routes));
    await outbox.emit(InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z"));
    expect(delivered).toEqual(["invoice.paid"]);
  });
});
