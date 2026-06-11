# @eventengine/store

The permanent, queryable event record — and the projections + replay built on it. It plugs into the engine as **two handlers**, mirroring the Ruby gem's `Recorder` + `ProjectionDispatcher`.

## Wire it in

```ts
const store = new EventStore(new InMemoryAppendOnlyStore<StoredEvent>(), onProjectionError);
engine.registerHandler(store.recorder(), "all");            // records every dispatched event
engine.registerHandler(store.projectionDispatcher(), "all"); // runs projections
```

Recording happens **via dispatch**, not a manual call — `emit` an event and the recorder appends it. The recorder runs before the projection dispatcher, so an event is durable before projections see it.

## API

- **`recorder()`** → a `Handler` that appends the event to the log.
- **`projectionDispatcher()`** → a `Handler` that runs every subscribed projection, **isolated**: if one throws, the rest still run and the error goes to the constructor's `onProjectionError` (the live `subscribe` path). The append is never undone.
- **`subscribe(projection)`** — register a projection (any `(event) => void | Promise<void>`).
- **`append(event)`** — record directly (used by the recorder; also handy in tests).
- **`all()`** — every recorded event, paged through the cursor.
- **`replay(projection)`** — walk the whole log through a projection to rebuild state (event sourcing). Unlike `subscribe`, replay **fails fast** — a rebuild that hits a bad event should surface, not skip.

## Status

Real and TDD-tested over the in-memory `AppendOnlyStore`. A Postgres-backed adapter (with the gem's immutable `stored_events` table) is pending. Projection isolation + the error handler are an enhancement over the Ruby gem.
