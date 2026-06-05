# @event-engine/core

The foundation: declare events, build the normalized Event envelope, and drive the `emit → dispatch → handlers` spine. Everything else registers into it.

## Define events

```ts
const InvoicePaid = defineEvent({
  name: "invoice.paid",
  type: "billing",      // optional; defaults to name
  version: 1,
  level: Level.Outbox,
  schema: z.object({ amountCents: z.number() }),
});
```

- **`defineEvent(spec)`** → a definition with `name`, a `fingerprint` (sha256 of `name:version:json-schema`), and `build(input, occurredAt, options?)`.
- **`build`** validates the input through the zod schema, **freezes** the payload, and returns the full [Event envelope](../architecture.md#the-event-envelope). `options` carries `metadata`, `idempotencyKey`, and `aggregateType/Id/Version`.

## The EventEngine bus

```ts
const engine = new EventEngine();
engine.registerHandler(handler, "all" | [Level.Outbox, Level.Broker]);
engine.subscribe("invoice.paid", (event) => { /* ... */ });
await engine.emit(InvoicePaid, { amountCents: 100 }, occurredAt);
```

- **`emit`** builds the envelope, fires the `"emitted"` notification, then dispatches.
- **`registerHandler(handler, levels)`** — handlers receive every event whose level matches.
- **`subscribe` / `subscribersFor`** — the `SubscriberRegistry`, used by delivery's level-1 path.

## Registries (also usable standalone)

- **`HandlerRegistry`** — `register(handler, levels)` + level-gated `dispatch(event)`.
- **`SubscriberRegistry`** — subscribers keyed by event name.
- **`EventRegistry`** — the catalog of definitions; rejects re-registering a changed shape with `SchemaDriftError`.

## Notifications

```ts
engine.notifications.on("emitted", (event) => logger.info(event.name));
```

A typed pub/sub bus (`Notifications<Channels>`) — the analog of `ActiveSupport::Notifications`. Core fires `emitted`; other packages fire their own channels.

## Status

Real and TDD-tested. The schema-file generate/load/dump workflow and auto-versioning-by-fingerprint (in the Ruby core) are not yet ported.
