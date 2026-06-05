import { describe, it, expect } from "vitest";
import { Level, type Subscriber } from "@event-engine/core";
import { Delivery } from "../src/delivery";

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
});
