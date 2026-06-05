import { describe, it, expect } from "vitest";
import { Level, type Subscriber } from "@event-engine/core";
import { Delivery, UnsupportedLevelError } from "../src/delivery";
import type { OutboxEvent } from "../src/outbox";

const noOutbox = { emit: async () => undefined };

describe("Delivery", () => {
  it("runs subscribers synchronously for in-process events", async () => {
    const ran: string[] = [];
    const subscriber: Subscriber = (event) => {
      ran.push(event.name);
    };
    const delivery = new Delivery({
      subscribersFor: (name) => (name === "user.signup" ? [subscriber] : []),
      outbox: noOutbox,
    });
    await delivery.handler()({
      name: "user.signup",
      level: Level.InProcess,
      payload: {},
      occurredAt: "t",
    });
    expect(ran).toEqual(["user.signup"]);
  });

  it("sends outbox-level events to the outbox", async () => {
    const emitted: OutboxEvent[] = [];
    const delivery = new Delivery({
      subscribersFor: () => [],
      outbox: {
        emit: async (event) => {
          emitted.push(event);
        },
      },
    });
    await delivery.handler()({
      name: "invoice.paid",
      level: Level.Outbox,
      payload: 1,
      occurredAt: "t",
    });
    expect(emitted.map((event) => event.name)).toEqual(["invoice.paid"]);
  });

  it("rejects event-sourcing level events", async () => {
    const delivery = new Delivery({
      subscribersFor: () => [],
      outbox: noOutbox,
    });
    let caught: unknown;
    try {
      await delivery.handler()({
        name: "x",
        level: Level.EventSourcing,
        payload: 1,
        occurredAt: "t",
      });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(UnsupportedLevelError);
  });
});
