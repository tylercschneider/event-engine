import { describe, it, expect } from "vitest";
import { Level } from "@stats/event-engine";
import { levelRouter, UnroutableLevelError } from "../src/router";
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

  it("throws UnroutableLevelError when no transport is registered for the level", async () => {
    const route = levelRouter(new Map());
    const event: OutboxEvent = {
      name: "broadcast",
      occurredAt: "t",
      payload: 1,
      level: Level.Broker,
    };
    let caught: unknown;
    try {
      await route(event);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(UnroutableLevelError);
  });
});
