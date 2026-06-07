# @event-engine/telemetry

The high-volume, fire-and-forget sink for signals (page views, clicks). Its own data system, orthogonal to the durability ladder — not a level. The deliberate opposite of `@event-engine/delivery`: no transaction, no outbox, no per-event durability — just cheap, batched throughput. Zero runtime dependencies.

## The batching collector

```ts
const collector = new Collector(sink, 500); // flush every 500 signals
await collector.collect(signal); // buffered
await collector.flush();         // or on demand
```

`collect` buffers and auto-flushes a batch to the `Sink` at the batch size; `flush` sends what's buffered.

## The endpoint handler

Framework-agnostic — takes a parsed body, returns a result, so any web framework wraps it in one line:

```ts
const handle = collectorHandler(collector);
// Express:  app.post("/t", async (req, res) => res.json(await handle(req.body)))
```

A non-array body throws `InvalidPayloadError` (so the host returns 400).

## The sink

```ts
const sink = new ColumnarSink();   // lays signals out by column (name[] / occurredAt[] / payload[])
collector flushes batches here;
sink.columns; // queryable columnar layout — the reference for a Parquet/lake sink
```

## Status

Real and TDD-tested. A real columnar/lake sink adapter is the production gap. Shares `@event-engine/core` event definitions (any defined event, at any level, can feed it) but pulls in **none** of the delivery machinery.
