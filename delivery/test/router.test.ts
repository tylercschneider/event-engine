import { describe, it, expect } from "vitest";
import { Level } from "@stats/event-engine";
import { levelRouter } from "../src/router";
import type { OutboxEvent, Transport } from "../src/outbox";

describe("levelRouter", () => {
  it("delivers an event to the transport registered for its level", async () => {
    const delivered: OutboxEvent[] = [];
    const outboxTransport: Transport = (event) => {
      delivered.push(event);
    };
    const route = levelRouter(new Map([[Level.Outbox, outboxTransport]]));
    const event: OutboxEvent = {
      name: "invoice.paid",
      occurredAt: "t",
      payload: 1,
      level: Level.Outbox,
    };
    await route(event);
    expect(delivered).toEqual([event]);
  });
});
