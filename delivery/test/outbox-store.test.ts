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

  it("lists all records", () => {
    const store = new OutboxStore();
    store.record(event);
    store.record(event);
    expect(store.list()).toHaveLength(2);
  });

  it("lists only pending records via pending()", () => {
    const store = new OutboxStore();
    const first = store.record(event);
    store.record(event);
    store.markPublished(first.id);
    expect(store.pending().map((record) => record.status)).toEqual(["pending"]);
  });

  it("lists only dead-lettered records via deadLetters()", () => {
    const store = new OutboxStore();
    const first = store.record(event);
    store.record(event);
    store.markDeadLettered(first.id, "boom");
    expect(store.deadLetters().map((record) => record.id)).toEqual([first.id]);
  });

  it("retries a dead-lettered record back to pending", () => {
    const store = new OutboxStore();
    const first = store.record(event);
    store.markDeadLettered(first.id, "boom");
    store.retry(first.id);
    expect(store.counts()).toMatchObject({ pending: 1, deadLettered: 0 });
  });
});
