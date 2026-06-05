import { describe, it, expect } from "vitest";
import { OutboxStore } from "../src/outbox-store";
import type { OutboxEvent } from "../src/outbox";

const event: OutboxEvent = { name: "invoice.paid", occurredAt: "t", payload: 1 };

describe("OutboxStore", () => {
  it("records an event as pending", () => {
    const store = new OutboxStore();
    const record = store.record(event);
    expect(record.status).toBe("pending");
  });

  it("counts pending records", () => {
    const store = new OutboxStore();
    store.record(event);
    store.record(event);
    expect(store.counts()).toEqual({
      total: 2,
      pending: 2,
      published: 0,
      deadLettered: 0,
    });
  });

  it("marks a record published", () => {
    const store = new OutboxStore();
    const record = store.record(event);
    store.markPublished(record.id);
    expect(store.counts()).toMatchObject({ pending: 0, published: 1 });
  });

  it("marks a record dead-lettered", () => {
    const store = new OutboxStore();
    const record = store.record(event);
    store.markDeadLettered(record.id, "boom");
    expect(store.counts()).toMatchObject({ pending: 0, deadLettered: 1 });
  });
});
