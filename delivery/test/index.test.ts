import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level, EventEngine } from "@event-engine/core";
import {
  InMemoryAppendOnlyStore,
  InlineJobQueue,
  InMemoryTransactionManager,
} from "@event-engine/ports";
import {
  Outbox,
  Delivery,
  OutboxStore,
  OutboxDashboard,
  OutboxPublisher,
  levelRouter,
  retrying,
  type OutboxEvent,
  type Transport,
  type DeadLetter,
} from "../src/index";

describe("@event-engine/delivery public api", () => {
  it("emits a defined event and delivers it through a transport via the package entry", async () => {
    const InvoicePaid = defineEvent({
      name: "invoice.paid",
      version: 1,
      level: Level.Outbox,
      schema: z.object({ amountCents: z.number() }),
    });
    const log = new InMemoryAppendOnlyStore<OutboxEvent>();
    const jobs = new InlineJobQueue();
    const transactions = new InMemoryTransactionManager();
    const delivered: string[] = [];
    const outbox = new Outbox(log, jobs, transactions, (event) => {
      delivered.push(event.name);
    });
    await outbox.emit(InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z"));
    expect(delivered).toEqual(["invoice.paid"]);
  });

  it("routes an emitted event to the transport for its level through the package entry", async () => {
    const InvoicePaid = defineEvent({
      name: "invoice.paid",
      version: 1,
      level: Level.Outbox,
      schema: z.object({ amountCents: z.number() }),
    });
    const log = new InMemoryAppendOnlyStore<OutboxEvent>();
    const jobs = new InlineJobQueue();
    const transactions = new InMemoryTransactionManager();
    const delivered: string[] = [];
    const routes = new Map<Level, Transport>([
      [
        Level.Outbox,
        (event) => {
          delivered.push(event.name);
        },
      ],
    ]);
    const outbox = new Outbox(log, jobs, transactions, levelRouter(routes));
    await outbox.emit(InvoicePaid.build({ amountCents: 100 }, "2026-01-01T00:00:00Z"));
    expect(delivered).toEqual(["invoice.paid"]);
  });

  it("dead-letters an undeliverable event emitted through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<OutboxEvent>();
    const jobs = new InlineJobQueue();
    const transactions = new InMemoryTransactionManager();
    const deadLettered: DeadLetter[] = [];
    const transport = retrying(
      () => {
        throw new Error("broker down");
      },
      {
        attempts: 3,
        onDeadLetter: (entry) => {
          deadLettered.push(entry);
        },
      },
    );
    const outbox = new Outbox(log, jobs, transactions, transport);
    await outbox.emit({ name: "invoice.paid", occurredAt: "t", payload: 1 });
    expect(deadLettered.map((entry) => entry.event.name)).toEqual([
      "invoice.paid",
    ]);
  });

  it("routes an in-process event to a subscriber through the EventEngine via the package entry", async () => {
    const engine = new EventEngine();
    const ran: string[] = [];
    engine.subscribe("user.signup", (event) => {
      ran.push(event.name);
    });
    const log = new InMemoryAppendOnlyStore<OutboxEvent>();
    const outbox = new Outbox(
      log,
      new InlineJobQueue(),
      new InMemoryTransactionManager(),
      () => undefined,
    );
    const delivery = new Delivery({
      subscribersFor: (name) => engine.subscribersFor(name),
      outbox,
    });
    engine.registerHandler(delivery.handler(), "all");

    const Signup = defineEvent({
      name: "user.signup",
      version: 1,
      level: Level.InProcess,
      schema: z.object({ userId: z.string() }),
    });
    await engine.emit(Signup, { userId: "u1" }, "2026-01-01T00:00:00Z");
    expect(ran).toEqual(["user.signup"]);
  });

  it("tracks outbox record state through the package entry", () => {
    const store = new OutboxStore();
    const record = store.record({
      name: "invoice.paid",
      occurredAt: "t",
      payload: 1,
    });
    store.markPublished(record.id);
    expect(store.counts()).toMatchObject({ total: 1, published: 1, pending: 0 });
  });

  it("recovers dead-lettered events via the dashboard through the package entry", () => {
    const store = new OutboxStore();
    const record = store.record({
      name: "invoice.paid",
      occurredAt: "t",
      payload: 1,
    });
    store.markDeadLettered(record.id, "broker down");
    const dashboard = new OutboxDashboard(store);
    dashboard.retryAll();
    expect(dashboard.summary()).toMatchObject({ pending: 1, deadLettered: 0 });
  });

  it("publishes the outbox and reflects it in the dashboard through the package entry", async () => {
    const store = new OutboxStore();
    store.record({ name: "invoice.paid", occurredAt: "t", payload: 1 });
    const delivered: string[] = [];
    const publisher = new OutboxPublisher({
      store,
      transport: (event) => {
        delivered.push(event.name);
      },
    });
    await publisher.publish();
    const dashboard = new OutboxDashboard(store);
    expect(dashboard.summary()).toMatchObject({ published: 1, pending: 0 });
  });
});
