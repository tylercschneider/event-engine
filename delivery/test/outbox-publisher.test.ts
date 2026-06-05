import { describe, it, expect } from "vitest";
import { Notifications } from "@event-engine/core";
import {
  OutboxPublisher,
  type DeliveryChannels,
} from "../src/outbox-publisher";
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

  it("fires a published notification for each published record", async () => {
    const store = new OutboxStore();
    store.record(event);
    const notifications = new Notifications<DeliveryChannels>();
    const published: string[] = [];
    notifications.on("published", (record) => {
      published.push(record.event.name);
    });
    const publisher = new OutboxPublisher({
      store,
      transport: async () => undefined,
      notifications,
    });
    await publisher.publish();
    expect(published).toEqual(["invoice.paid"]);
  });

  it("fires a dead_lettered notification for each dead-lettered record", async () => {
    const store = new OutboxStore();
    store.record(event);
    const notifications = new Notifications<DeliveryChannels>();
    const deadLettered: string[] = [];
    notifications.on("dead_lettered", (record) => {
      deadLettered.push(record.event.name);
    });
    const publisher = new OutboxPublisher({
      store,
      transport: () => {
        throw new Error("down");
      },
      notifications,
    });
    await publisher.publish();
    expect(deadLettered).toEqual(["invoice.paid"]);
  });
});
