// the-local provider config for @eventengine/store. Edit this, then run
// `the-local build store` to re-render the committed agents under the-local/agents/.
// The committed .md are the contract a host installs; this is their source.

const reference = `## @eventengine/store

The permanent, queryable event record — plus the projections and replay built on
it. It is **built on @eventengine/core**: it plugs into core's \`EventEngine\` as
two handlers (mirroring the Ruby gem's \`Recorder\` + \`ProjectionDispatcher\`) and
records the same Event envelope core defines. It also uses an append-only store
from @eventengine/ports.

### Wire it in

\`\`\`ts
const store = new EventStore(new InMemoryAppendOnlyStore(), onProjectionError);
engine.registerHandler(store.recorder(), "all");            // records every dispatched event
engine.registerHandler(store.projectionDispatcher(), "all"); // runs projections
\`\`\`

Recording happens **via dispatch**, not a manual call — \`emit\` an event and the
recorder appends it. The recorder runs before the projection dispatcher, so an
event is durable before any projection sees it.

### API

- \`recorder()\` → a \`Handler\` that appends the event to the log.
- \`projectionDispatcher()\` → a \`Handler\` that runs every subscribed projection,
  **isolated**: if one throws, the rest still run and the error goes to the
  constructor's \`onProjectionError\`. The append is never undone.
- \`subscribe(projection)\` — register a projection, any
  \`(event) => void | Promise<void>\`.
- \`append(event)\` — record directly (used by the recorder; handy in tests).
- \`all()\` — every recorded event, paged through the cursor.
- \`replay(projection)\` — walk the whole log through a projection to rebuild
  state (event sourcing). Unlike \`subscribe\`, replay **fails fast** — a rebuild
  that hits a bad event should surface, not skip.

### Conventions

- Record through the engine: register \`recorder()\` and \`projectionDispatcher()\`
  and \`emit\`; don't append by hand outside tests.
- Use \`subscribe\` for live projections (isolated) and \`replay\` for rebuilds
  (fail-fast).
- The store holds core's Event envelope verbatim; it doesn't redefine events —
  that's @eventengine/core's job.`;

export default {
  prefix: "store",
  scope: "the permanent event record — recording, projections, and replay on core",
  agentsDir: "the-local/agents",
  agents: [
    {
      name: "info",
      description:
        "Use to learn @eventengine/store — the event record, recorder and " +
        "projection-dispatcher handlers, subscribe/replay, and how it builds on core.",
      tools: "Read",
      body:
        "You explain @eventengine/store, answering only from the reference: " +
        "EventStore plugs into core's EventEngine as a recorder and a " +
        "projection-dispatcher, records the Event envelope, runs isolated live " +
        "projections via subscribe, and rebuilds state via fail-fast replay. You " +
        "make no changes.",
      knowledge: reference,
    },
    {
      name: "develop",
      description:
        "Use PROACTIVELY for work involving @eventengine/store — recording, " +
        "projections, or replay. MUST BE USED instead of guessing store's API.",
      tools: "Read, Write, Edit, Grep",
      body:
        "You do @eventengine/store work following the reference exactly: wire the " +
        "recorder and projectionDispatcher into core's EventEngine, record via " +
        "emit (not by hand), register live projections with subscribe, and rebuild " +
        "state with replay. You know store builds on @eventengine/core and defer " +
        "event definition to it. You do not invent API the reference does not list.",
      knowledge: reference,
    },
  ],
};
