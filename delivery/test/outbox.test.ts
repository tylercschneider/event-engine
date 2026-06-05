import { describe, it, expect } from "vitest";
import {
  InMemoryAppendOnlyStore,
  InlineJobQueue,
  InMemoryTransactionManager,
} from "@stats/ports";
import { Outbox, type OutboxEvent } from "../src/outbox";

describe("Outbox", () => {
  it("delivers an emitted event to the transport", async () => {
    const log = new InMemoryAppendOnlyStore<OutboxEvent>();
    const jobs = new InlineJobQueue();
    const transactions = new InMemoryTransactionManager();
    const delivered: OutboxEvent[] = [];
    const outbox = new Outbox(log, jobs, transactions, (event) => {
      delivered.push(event);
    });
    await outbox.emit({ name: "invoice.paid", occurredAt: "t", payload: 1 });
    expect(delivered).toEqual([
      { name: "invoice.paid", occurredAt: "t", payload: 1 },
    ]);
  });
});
