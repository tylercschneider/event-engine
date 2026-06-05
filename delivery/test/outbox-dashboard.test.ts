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
});
