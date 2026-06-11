# @eventengine/core

The foundation: declare events, build the normalized Event envelope, and drive the `emit → dispatch → handlers` spine. Everything else registers into it.

## Define events

```ts
const InvoicePaid = defineEvent({
  name: "invoice.paid",
  type: "billing",      // optional; defaults to name
  version: 1,
  processType: "durable",  // inline | background | durable | broker | telemetry | sourced
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

## Schema-file workflow

Each definition also carries a version-independent **`shape`** (sha256 of `name:json-schema`, no version), so a definition is structurally a `{ name, shape }` and can drive auto-versioning:

- **`mergeSchema(declared, committed)`** — append-only auto-versioning: a new event gets version 1; a changed shape gets a new version while keeping the prior ones.
- **`dumpSchema(entries)` / `loadSchema(contents)`** — serialize the committed schema to JSON (ordered by name then version) and parse it back; blank contents load as an empty schema.
- **`checkSchemaDrift(committedContents, declared)`** — throws `SchemaFileDriftError` when the committed schema is out of date (i.e. re-dumping would change it). The committed-file analog of the in-memory `EventRegistry` `SchemaDriftError`.

### The `schema` CLI

`createSchemaCli(definitions, effects)` provides `dump` and `check` over an injected I/O seam (`SchemaCliEffects { readFile, writeFile, log }`); `createNodeEffects()` supplies the real `node:fs`/`console` implementation. Wire a thin bin in your own project — it hands the CLI the definitions it already holds:

```ts
#!/usr/bin/env node
import { createSchemaCli, createNodeEffects } from "@eventengine/core";
import { OrderPlaced, OrderShipped } from "../src/events";

const code = createSchemaCli([OrderPlaced, OrderShipped], createNodeEffects()).run(
  process.argv,
);
process.exit(code);
```

```
schema dump [path]    # regenerate ./event-schema.json (default path)
schema check [path]   # exit 1 + remediation log if the committed schema drifted
```

## Status

Real and TDD-tested, including the schema-file generate/load/dump workflow, auto-versioning by shape, drift detection, and the `schema` CLI.
