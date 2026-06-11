import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import {
  defineEvent,
  Level,
  EventRegistry,
  SchemaDriftError,
  HandlerRegistry,
  EventEngine,
  CloudReporter,
  mergeSchema,
  dumpSchema,
  loadSchema,
  checkSchemaDrift,
  SchemaFileDriftError,
  createSchemaCli,
  createNodeEffects,
  type ReportEntry,
} from "../src/index";

describe("@eventengine/core public api", () => {
  it("defines and builds a validated event through the package entry", () => {
    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      processType: "inline",
      schema: z.object({ userId: z.string() }),
    });
    const event = Signup.build({ userId: "u1" }, "2026-01-01T00:00:00Z");
    expect(event.payload).toEqual({ userId: "u1" });
  });

  it("builds a full event envelope through the package entry", () => {
    const Signup = defineEvent({
      name: "user.signup",
      version: 2,
      processType: "inline",
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
      processType: "inline",
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
      processType: "durable",
      schema: z.object({ total: z.number() }),
    });
    const drifted = defineEvent({
      name: "order.placed",
      version: 1,
      processType: "durable",
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
      processType: "inline",
      schema: z.object({ userId: z.string() }),
    });
    await engine.emit(Signup, { userId: "u1" }, "2026-01-01T00:00:00Z");
    expect(seen).toEqual(["user.signup"]);
  });

  it("dispatches the full event envelope to handlers through the package entry", async () => {
    const engine = new EventEngine();
    let received: unknown;
    engine.registerHandler((event) => {
      received = event;
    }, "all");
    const Signup = defineEvent({
      name: "user.signup",
      version: 2,
      processType: "inline",
      schema: z.object({ userId: z.string() }),
    });
    await engine.emit(Signup, { userId: "u1" }, "2026-01-01T00:00:00Z", {
      metadata: { source: "web" },
      idempotencyKey: "idem-1",
      aggregateType: "User",
      aggregateId: "u1",
      aggregateVersion: 1,
    });
    expect(received).toMatchObject({
      name: "user.signup",
      type: "user.signup",
      version: 2,
      idempotencyKey: "idem-1",
      metadata: { source: "web" },
      aggregateType: "User",
      aggregateId: "u1",
      aggregateVersion: 1,
    });
  });

  it("observes emitted events via notifications through the package entry", async () => {
    const engine = new EventEngine();
    const observed: string[] = [];
    engine.notifications.on("emitted", (event) => {
      observed.push(event.name);
    });
    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      processType: "inline",
      schema: z.object({ userId: z.string() }),
    });
    await engine.emit(Signup, { userId: "u1" }, "2026-01-01T00:00:00Z");
    expect(observed).toEqual(["user.signup"]);
  });

  it("resolves delivery capabilities on a defined event through the package entry", () => {
    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      processType: "background",
      schema: z.object({ userId: z.string() }),
    });
    const event = Signup.build({ userId: "u1" }, "2026-01-01T00:00:00Z");
    expect(event.capabilities).toEqual({
      backgrounded: true,
      durable: false,
      broker: false,
    });
  });

  it("carries a correlation event id on the emitted notification through the package entry", async () => {
    const engine = new EventEngine();
    let observed: string | undefined;
    engine.notifications.on("emitted", (event) => {
      observed = event.eventId;
    });
    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      processType: "inline",
      schema: z.object({ userId: z.string() }),
    });
    await engine.emit(Signup, { userId: "u1" }, "2026-01-01T00:00:00Z");
    expect(observed?.length).toBeGreaterThan(0);
  });

  it("reports emitted events as metadata to the cloud client through the package entry", async () => {
    const engine = new EventEngine();
    const sent: ReportEntry[][] = [];
    const reporter = new CloudReporter((batch) => {
      sent.push(batch);
    });
    engine.notifications.on("emitted", (event) => {
      reporter.track("emitted", event);
    });
    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      processType: "inline",
      schema: z.object({ userId: z.string() }),
    });
    await engine.emit(Signup, { userId: "u1" }, "2026-01-01T00:00:00Z");
    await reporter.flush();
    expect(sent[0]?.[0]).toMatchObject({ name: "user.signup", status: "emitted" });
  });

  it("reports the full event metadata to the cloud client through the package entry", async () => {
    const engine = new EventEngine();
    const sent: ReportEntry[][] = [];
    const reporter = new CloudReporter((batch) => {
      sent.push(batch);
    });
    engine.notifications.on("emitted", (event) => {
      reporter.track("emitted", event);
    });
    const Signup = defineEvent({
      name: "user.signup",
      version: 3,
      processType: "inline",
      schema: z.object({ userId: z.string() }),
    });
    await engine.emit(Signup, { userId: "u1" }, "2026-01-01T00:00:00Z", {
      idempotencyKey: "idem-1",
      aggregateType: "User",
      aggregateId: "u1",
      aggregateVersion: 2,
    });
    await reporter.flush();
    expect(sent[0]?.[0]).toMatchObject({
      name: "user.signup",
      version: 3,
      idempotencyKey: "idem-1",
      aggregateType: "User",
      aggregateId: "u1",
      aggregateVersion: 2,
    });
  });

  it("auto-versions a changed event across merges through the package entry", () => {
    const first = mergeSchema([{ name: "order.placed", shape: "a" }], []);
    const second = mergeSchema([{ name: "order.placed", shape: "b" }], first);
    expect(second.map((entry) => entry.version)).toEqual([1, 2]);
  });

  it("feeds a definition shape into mergeSchema without bumping on a version change", () => {
    const v1 = defineEvent({
      name: "order.shipped",
      version: 1,
      processType: "durable",
      schema: z.object({ id: z.string() }),
    });
    const v2 = defineEvent({
      name: "order.shipped",
      version: 2,
      processType: "durable",
      schema: z.object({ id: z.string() }),
    });
    const committed = mergeSchema(
      [{ name: v2.name, shape: v2.shape }],
      mergeSchema([{ name: v1.name, shape: v1.shape }], []),
    );
    expect(committed.map((entry) => entry.version)).toEqual([1]);
  });

  it("round-trips a committed schema through dump and load via the package entry", () => {
    const committed = mergeSchema([{ name: "order.placed", shape: "x" }], []);
    expect(loadSchema(dumpSchema(committed))).toEqual(committed);
  });

  it("detects schema drift for a changed definition through the package entry", () => {
    const original = defineEvent({
      name: "order.placed",
      version: 1,
      processType: "durable",
      schema: z.object({ total: z.number() }),
    });
    const committed = dumpSchema(
      mergeSchema([{ name: original.name, shape: original.shape }], []),
    );
    const changed = defineEvent({
      name: "order.placed",
      version: 1,
      processType: "durable",
      schema: z.object({ total: z.string() }),
    });
    let caught: unknown;
    try {
      checkSchemaDrift(committed, [{ name: changed.name, shape: changed.shape }]);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SchemaFileDriftError);
  });

  it("dumps then checks a definition with no drift through the package entry", () => {
    const files: Record<string, string> = {};
    const effects = {
      readFile: (path: string) => files[path] ?? "",
      writeFile: (path: string, contents: string) => {
        files[path] = contents;
      },
      log: () => undefined,
    };
    const OrderPlaced = defineEvent({
      name: "order.placed",
      version: 1,
      processType: "durable",
      schema: z.object({ total: z.number() }),
    });
    const cli = createSchemaCli([OrderPlaced], effects);
    cli.run(["node", "schema", "dump"]);
    expect(cli.run(["node", "schema", "check"])).toBe(0);
  });

  it("dumps and checks against the real filesystem through the package entry", () => {
    const path = join(
      mkdtempSync(join(tmpdir(), "event-schema-")),
      "schema.json",
    );
    const OrderPlaced = defineEvent({
      name: "order.placed",
      version: 1,
      processType: "durable",
      schema: z.object({ total: z.number() }),
    });
    const cli = createSchemaCli([OrderPlaced], createNodeEffects());
    cli.run(["node", "schema", "dump", path]);
    expect(cli.run(["node", "schema", "check", path])).toBe(0);
  });
});
