import { describe, it, expect } from "vitest";
import { type ProcessType, type Subscriber } from "@event-engine/core";
import { InlineJobQueue } from "@event-engine/ports";
import { Delivery } from "../src/delivery";
import type { OutboxEvent } from "../src/outbox";

const noOutbox = { emit: async () => undefined };

function dispatched(name: string, processType: ProcessType, payload: unknown = 1) {
  return { name, processType, payload, occurredAt: "t" };
}

describe("Delivery", () => {
  it("runs subscribers synchronously for inline events", async () => {
    const ran: string[] = [];
    const subscriber: Subscriber = (event) => {
      ran.push(event.name);
    };
    const delivery = new Delivery({
      subscribersFor: (name) => (name === "user.signup" ? [subscriber] : []),
      outbox: noOutbox,
    });
    await delivery.handler()(dispatched("user.signup", "inline", {}));
    expect(ran).toEqual(["user.signup"]);
  });

  it("sends durable events to the outbox", async () => {
    const emitted: OutboxEvent[] = [];
    const delivery = new Delivery({
      subscribersFor: () => [],
      outbox: {
        emit: async (event) => {
          emitted.push(event);
        },
      },
    });
    await delivery.handler()(dispatched("invoice.paid", "durable"));
    expect(emitted.map((event) => event.name)).toEqual(["invoice.paid"]);
  });

  it("dispatches subscribers via a background job for background events", async () => {
    const ran: string[] = [];
    const subscriber: Subscriber = (event) => {
      ran.push(event.name);
    };
    const delivery = new Delivery({
      subscribersFor: (name) => (name === "x" ? [subscriber] : []),
      outbox: noOutbox,
      jobs: new InlineJobQueue(),
    });
    await delivery.handler()(dispatched("x", "background"));
    expect(ran).toEqual(["x"]);
  });

  it("ignores process types it does not own", async () => {
    const emitted: OutboxEvent[] = [];
    const ran: string[] = [];
    const delivery = new Delivery({
      subscribersFor: () => [
        (event) => {
          ran.push(event.name);
        },
      ],
      outbox: {
        emit: async (event) => {
          emitted.push(event);
        },
      },
    });
    await delivery.handler()(dispatched("page.view", "telemetry"));
    expect([emitted.length, ran.length]).toEqual([0, 0]);
  });
});
