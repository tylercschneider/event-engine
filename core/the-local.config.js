// the-local provider config for @eventengine/core. Edit this, then run
// `the-local build core` to re-render the committed agents under the-local/agents/.
// The committed .md are the contract a host installs; this is their source.

const reference = `## @eventengine/core

The foundation of event-engine: declare events, build the normalized Event
envelope, and drive the \`emit → dispatch → handlers\` spine. Everything else
(store, delivery, metrics, telemetry) registers into it.

### Define events

\`defineEvent({ name, version, processType, schema, type? })\` returns a
definition with \`name\`, a \`fingerprint\` (sha256 of \`name:version:json-schema\`),
a version-independent \`shape\` (sha256 of \`name:json-schema\`), and
\`build(input, occurredAt, options?)\`.

- \`processType\` is one of \`inline | background | durable | broker | telemetry |
  sourced\` and maps to a delivery Level.
- \`build\` validates the input through the zod schema, **freezes** the payload,
  and returns the full Event envelope — one declaration gives you runtime
  validation **and** a static payload type. \`options\` carries \`metadata\`,
  \`idempotencyKey\`, and \`aggregateType/Id/Version\`.

### The EventEngine bus

\`new EventEngine()\`; \`engine.registerHandler(handler, "all" | [Level...])\`;
\`engine.subscribe(name, fn)\`; \`await engine.emit(def, input, occurredAt)\`.

- \`emit\` builds the envelope, fires the \`"emitted"\` notification, then dispatches
  to level-matched handlers.
- \`subscribe\` / \`subscribersFor\` back delivery's level-1 path.

### Registries

- \`HandlerRegistry\` — \`register(handler, levels)\` + level-gated \`dispatch(event)\`.
- \`SubscriberRegistry\` — subscribers keyed by event name.
- \`EventRegistry\` — the catalog of definitions; rejects re-registering a changed
  shape with \`SchemaDriftError\`.

### Notifications

\`engine.notifications.on("emitted", fn)\` — a typed pub/sub bus, the analog of
\`ActiveSupport::Notifications\`. Core fires \`emitted\`; other packages fire theirs.

### Schema-file workflow

The version-independent \`shape\` drives append-only auto-versioning:

- \`mergeSchema(declared, committed)\` — a new event gets version 1; a changed
  shape gets a new version while keeping the prior ones.
- \`dumpSchema\` / \`loadSchema\` — serialize the committed schema to ordered JSON
  and parse it back.
- \`checkSchemaDrift(committedContents, declared)\` — throws \`SchemaFileDriftError\`
  when the committed schema is stale.
- \`createSchemaCli(definitions, effects)\` exposes \`dump\` / \`check\` over an
  injected I/O seam; \`createNodeEffects()\` supplies the \`node:fs\`/\`console\`
  implementation. Wire a thin bin that passes in your definitions.

### Conventions

- Define each event once with a zod schema; never hand-build the envelope — use
  \`build\`.
- The payload is frozen; treat events as immutable.
- Commit the schema file and run \`schema check\` in CI to catch drift.`;

export default {
  prefix: "core",
  scope: "event definitions and the emit → dispatch → handlers spine",
  agentsDir: "the-local/agents",
  agents: [
    {
      name: "info",
      description:
        "Use to learn @eventengine/core — defining events, the Event envelope, " +
        "the EventEngine bus, the registries, and the schema-file workflow.",
      tools: "Read",
      body:
        "You explain @eventengine/core, answering only from the reference: " +
        "defineEvent declares events with a zod schema and processType, build " +
        "validates and freezes the Event envelope, EventEngine drives emit → " +
        "dispatch → level-matched handlers, and the schema-file workflow " +
        "auto-versions by shape. You make no changes.",
      knowledge: reference,
    },
    {
      name: "develop",
      description:
        "Use PROACTIVELY for work involving @eventengine/core — defining events, " +
        "wiring the EventEngine, or the schema-file workflow. MUST BE USED instead " +
        "of guessing core's API.",
      tools: "Read, Write, Edit, Grep",
      body:
        "You do @eventengine/core work following the reference exactly: define " +
        "events with defineEvent (name, version, processType, zod schema), build " +
        "the envelope via build (never by hand), register handlers by level on " +
        "EventEngine, and keep the committed schema in sync with `schema dump` / " +
        "`check`. You do not invent API the reference does not list.",
      knowledge: reference,
    },
  ],
};
