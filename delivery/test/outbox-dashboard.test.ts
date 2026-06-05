import { describe, it, expect } from "vitest";
import { OutboxDashboard } from "../src/outbox-dashboard";
import { OutboxStore } from "../src/outbox-store";
import type { OutboxEvent } from "../src/outbox";

const event: OutboxEvent = { name: "invoice.paid", occurredAt: "t", payload: 1 };

describe("OutboxDashboard", () => {
  it("summarizes the outbox counts", () => {
    const store = new OutboxStore();
    store.record(event);
    const dashboard = new OutboxDashboard(store);
    expect(dashboard.summary()).toMatchObject({ total: 1, pending: 1 });
  });

  it("returns events limited to the page size", () => {
    const store = new OutboxStore();
    for (let i = 0; i < 3; i++) store.record(event);
    const dashboard = new OutboxDashboard(store);
    expect(dashboard.events(1, 2)).toHaveLength(2);
  });

  it("lists dead-lettered records", () => {
    const store = new OutboxStore();
    const record = store.record(event);
    store.markDeadLettered(record.id, "boom");
    const dashboard = new OutboxDashboard(store);
    expect(dashboard.deadLetters().map((entry) => entry.id)).toEqual([
      record.id,
    ]);
  });
});
