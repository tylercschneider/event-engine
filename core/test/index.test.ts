import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  defineEvent,
  Level,
  EventRegistry,
  SchemaDriftError,
  HandlerRegistry,
  EventEngine,
} from "../src/index";

describe("@event-engine/core public api", () => {
  it("defines and builds a validated event through the package entry", () => {
    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      level: Level.InProcess,
      schema: z.object({ userId: z.string() }),
    });
    const event = Signup.build({ userId: "u1" }, "2026-01-01T00:00:00Z");
    expect(event.payload).toEqual({ userId: "u1" });
  });

  it("builds a full event envelope through the package entry", () => {
    const Signup = defineEvent({
      name: "user.signup",
      version: 2,
      level: Level.InProcess,
      schema: z.object({ userId: z.string() }),
    });
    const event = Signup.build({ userId: "u1" }, "2026-01-01T00:00:00Z", {
      metadata: { source: "web" },
    });
    expect(event).toMatchObject({
      name: "user.signup",
      type: "user.signup",
      version: 2,
      level: Level.InProcess,
      occurredAt: "2026-01-01T00:00:00Z",
      metadata: { source: "web" },
    });
  });

  it("registers a defined event and lists it in the catalog", () => {
    const registry = new EventRegistry();
    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      level: Level.InProcess,
      schema: z.object({ userId: z.string() }),
    });
    registry.register(Signup);
    expect(registry.catalog().map((definition) => definition.name)).toContain(
      "user.signup",
    );
  });

  it("guards against schema drift through the package entry", () => {
    const registry = new EventRegistry();
    const original = defineEvent({
      name: "order.placed",
      version: 1,
      level: Level.Outbox,
      schema: z.object({ total: z.number() }),
    });
    const drifted = defineEvent({
      name: "order.placed",
      version: 1,
      level: Level.Outbox,
      schema: z.object({ total: z.string() }),
    });
    registry.register(original);
    let caught: unknown;
    try {
      registry.register(drifted);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SchemaDriftError);
  });

  it("dispatches an event only to handlers matching its level through the package entry", async () => {
    const registry = new HandlerRegistry();
    const ran: string[] = [];
    registry.register(() => {
      ran.push("broker");
    }, [Level.Broker]);
    registry.register(() => {
      ran.push("outbox");
    }, [Level.Outbox]);
    await registry.dispatch({
      name: "order.placed",
      level: Level.Outbox,
      payload: {},
      occurredAt: "t",
    });
    expect(ran).toEqual(["outbox"]);
  });

  it("emits a defined event through the EventEngine via the package entry", async () => {
    const engine = new EventEngine();
    const seen: string[] = [];
    engine.registerHandler((event) => {
      seen.push(event.name);
    }, "all");
    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      level: Level.InProcess,
      schema: z.object({ userId: z.string() }),
    });
    await engine.emit(Signup, { userId: "u1" }, "2026-01-01T00:00:00Z");
    expect(seen).toEqual(["user.signup"]);
  });
});
