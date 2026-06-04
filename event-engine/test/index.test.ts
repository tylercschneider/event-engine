import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level, EventRegistry } from "../src/index";

describe("@stats/event-engine public api", () => {
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
});
