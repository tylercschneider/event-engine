import { describe, it, expect } from "vitest";
import { OutboxPublisher } from "../src/outbox-publisher";
import { OutboxStore } from "../src/outbox-store";
import type { OutboxEvent } from "../src/outbox";

const event: OutboxEvent = { name: "invoice.paid", occurredAt: "t", payload: 1 };

describe("OutboxPublisher", () => {
  it("publishes pending records and marks them published", async () => {
    const store = new OutboxStore();
    store.record(event);
    const publisher = new OutboxPublisher({
      store,
      transport: async () => undefined,
    });
    await publisher.publish();
    expect(store.counts()).toMatchObject({ published: 1, pending: 0 });
  });

  it("dead-letters a record when the transport fails", async () => {
    const store = new OutboxStore();
    store.record(event);
    const publisher = new OutboxPublisher({
      store,
      transport: () => {
        throw new Error("down");
      },
    });
    await publisher.publish();
    expect(store.counts()).toMatchObject({ deadLettered: 1, pending: 0 });
  });
});
