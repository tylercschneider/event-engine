import { describe, it, expect } from "vitest";
import { HandlerRegistry, type DispatchedEvent } from "../src/handler-registry";
import { Level } from "../src/event";

function event(level: Level): DispatchedEvent {
  return { name: "invoice.paid", level, payload: 1, occurredAt: "t" };
}

describe("HandlerRegistry", () => {
  it("dispatches an event to a registered handler", async () => {
    const registry = new HandlerRegistry();
    const seen: string[] = [];
    registry.register((dispatched) => {
      seen.push(dispatched.name);
    }, "all");
    await registry.dispatch(event(Level.Outbox));
    expect(seen).toEqual(["invoice.paid"]);
  });

  it("skips handlers whose level filter excludes the event level", async () => {
    const registry = new HandlerRegistry();
    const seen: string[] = [];
    registry.register((dispatched) => {
      seen.push(dispatched.name);
    }, [Level.Broker]);
    await registry.dispatch(event(Level.InProcess));
    expect(seen).toEqual([]);
  });
});
