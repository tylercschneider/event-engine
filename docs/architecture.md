# Architecture — how event-engine works

## Mental model

An **event** is an immutable fact: something that happened, with its values frozen at that moment. You declare events once, emit them when they happen, and everything else — durable records, projections, reliable delivery, aggregation, dashboards — is derived from that one stream. The system splits into three stages:

```
CAPTURE                    DATA MANAGEMENT        DISPLAY
core (define + emit) ──┬── store ──── metrics ──── stats ──── dashboards
                       ├── delivery
                       └── telemetry
                              (all on the @event-engine/ports substrate)
```

## The spine: define → emit → dispatch → handlers

The heart of the system is in `@event-engine/core`. Everything hangs off **one flow**:

```
defineEvent(...)            declare an event (name, version, level, zod schema)
      │
engine.emit(def, input)     build the Event envelope, validate the payload
      │
engine.notifications        fire an "emitted" notification (observers can watch)
      │
HandlerRegistry.dispatch    fan the event out to every handler whose level matches
      │
      ├── store's Recorder            records the event durably
      ├── store's ProjectionDispatcher runs projections
      └── delivery's Handler           routes by level (sync / job / outbox / broker)
```

The key idea — and the thing that makes this a faithful copy of the Ruby gems — is that **`store` and `delivery` are not wired together by hand. They register as _handlers_ into the engine's dispatch.** You build one `EventEngine`, register the handlers you want, and `emit` drives the rest.

```ts
const engine = new EventEngine();
engine.registerHandler(store.recorder(), "all");
engine.registerHandler(store.projectionDispatcher(), "all");
engine.registerHandler(delivery.handler(), "all");

await engine.emit(InvoicePaid, { amountCents: 100 }, occurredAt);
// recorded + projected + routed for delivery — all from one emit
```

## The Event envelope

`emit` (via the definition's `build`) produces a normalized envelope every handler receives:

| Field | Meaning |
|---|---|
| `name` | the event name (e.g. `"invoice.paid"`) |
| `type` | a category; defaults to `name` |
| `version` | the schema version |
| `level` | the durability tier (see below) |
| `payload` | the validated, **frozen** payload |
| `occurredAt` | when it happened (ISO-8601, caller-supplied) |
| `metadata` | free-form context; defaults to `{}` |
| `idempotencyKey` | dedup key; auto-generated (`crypto.randomUUID`) if not provided |
| `aggregateType` / `aggregateId` / `aggregateVersion` | optional event-sourcing aggregate fields |

## The level ladder

Each event **declares** a durability level; `delivery` **routes** on it. Each rung adds infrastructure and a stronger guarantee than the one below it.

| Level | Name | Behavior |
|---|---|---|
| 1 | `InProcess` | subscribers run **synchronously** in the caller's stack |
| 2 | `Background` | subscribers run in a **background job** |
| 3 | `Outbox` | durable; recorded to the outbox, drained by the publisher |
| 4 | `Broker` | durable; published to a transport (e.g. Kafka) |
| 5 | `EventSourcing` | reserved / unsupported — delivery raises |

A `HandlerRegistry` registration carries a level filter (`"all"` or an explicit `Level[]`), so a handler only sees events at the levels it cares about.

## How the packages compose

- **`@event-engine/ports`** is the substrate the Ruby version gets from Rails (ActiveRecord, ActiveJob): storage, transactions, and a job queue, as small interfaces with in-memory reference adapters. Everything DB/job-bound binds through it instead of a concrete database.
- **`@event-engine/store`** registers a `Recorder` + `ProjectionDispatcher` into the engine. The recorder appends to an `AppendOnlyStore` (a port); projections fan out, isolated so one failure doesn't break the rest. `replay` walks the whole log to rebuild state.
- **`@event-engine/delivery`** registers one level-routing `Handler`. Durable levels write to a stateful `OutboxStore` (pending → published/dead-lettered); an `OutboxPublisher` drains it through a transport; an `OutboxDashboard` exposes the state and recovery (retry); the `retrying` decorator adds retry + dead-letter.
- **`@event-engine/telemetry`** is its own data system, orthogonal to the durability ladder — not a level. Any event (at any level), or a raw posted signal, can feed a batching `Collector` → columnar `Sink`; zero durability, zero dependencies.
- **`@event-engine/metrics`** turns recorded events into numbers (measures, rollups, mergeable sketches, a sandboxed expression DSL).
- **`@event-engine/stats`** is the display contract: a self-describing stat with a normalized result shape (`scalar`/`series`/`breakdown`) and a `StatSource` port.
- **`@event-engine/dashboards`** is headless dashboards-as-data: it resolves a dashboard config against a `DataProvider` into plain JSON; any frontend renders it.

## Transparency

`@event-engine/core` ships a typed `Notifications` bus (the analog of Ruby's `ActiveSupport::Notifications`). `EventEngine.emit` fires an `"emitted"` notification; observers — loggers, the dashboard, a future cloud reporter — subscribe without coupling to the emit path.

## Why a `ports` package exists (and Ruby has no equivalent)

Ruby's gems lean on Rails for persistence, transactions, and background jobs. TypeScript has no single default for those, so the port layer makes the seams explicit: production adapters (Postgres, BullMQ, Kafka) slot in behind the same interfaces the in-memory reference adapters implement, without changing a line of consumer code.
