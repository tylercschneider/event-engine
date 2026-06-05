import { describe, it, expect } from "vitest";
import { SubscriberRegistry, type Subscriber } from "../src/subscriber-registry";

const noop: Subscriber = () => undefined;

describe("SubscriberRegistry", () => {
  it("returns subscribers registered for an event name", () => {
    const registry = new SubscriberRegistry();
    registry.subscribe("invoice.paid", noop);
    expect(registry.subscribersFor("invoice.paid")).toEqual([noop]);
  });

  it("returns an empty list for an event with no subscribers", () => {
    const registry = new SubscriberRegistry();
    expect(registry.subscribersFor("unknown")).toEqual([]);
  });
});
