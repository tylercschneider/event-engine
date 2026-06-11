# @eventengine/delivery

Reliable event delivery: a level-routing handler, a stateful outbox, a publisher that drains it, an observability dashboard, and retry + dead-letter.

## The delivery handler

Registers one `Handler` into the engine that routes by the event's declared level:

```ts
const delivery = new Delivery({
  subscribersFor: (name) => engine.subscribersFor(name), // level 1: run synchronously
  outbox: { emit: (event) => outboxStore.record(event) }, // level 3/4: durable
  jobs: queue,                                            // level 2: background
});
engine.registerHandler(delivery.handler(), "all");
```

| Level | Routing |
|---|---|
| 1 InProcess | subscribers run synchronously |
| 2 Background | a `dispatch-subscribers` job runs them |
| 3 Outbox / 4 Broker | `outbox.emit` (durable) |
| 5 EventSourcing | `UnsupportedLevelError` |

## The stateful outbox

`OutboxStore` tracks each event's delivery state — the substance behind observability:

```ts
const store = new OutboxStore();
const record = store.record(event);  // pending
store.markPublished(record.id);       // -> published
store.markDeadLettered(id, error);    // -> dead-lettered, with the error
store.retry(id);                      // reset to pending
store.counts();        // { total, pending, published, deadLettered }
store.pending();       // for the publisher to drain
store.deadLetters();   // for the dashboard
```

`OutboxRecord` carries `id, event, status, attempts, publishedAt?, deadLetteredAt?, lastError?`.

## The publisher (poller)

```ts
await new OutboxPublisher({ store, transport }).publish();
// drains store.pending(), publishes each, marks published / dead-lettered
```

Pair `transport` with `retrying(...)` (below) so a per-record failure is terminal (retries already happened) and dead-letters.

## The observability dashboard

Headless data + actions, framework-agnostic — mirrors the Ruby dashboard's Home / Events / Dead Letters views:

```ts
const dashboard = new OutboxDashboard(store);
dashboard.summary();      // the stat cards
dashboard.events(2, 20);  // paged
dashboard.deadLetters();
dashboard.retryAll();     // the "Retry All" button
```

## Retry + dead-letter (transport decorator)

```ts
const transport = retrying(brokerTransport, {
  attempts: 5,
  onDeadLetter: ({ event, error, attempts }) => deadLetterTable.insert(event),
});
```

## Status

Real and TDD-tested over in-memory ports. Pending for production: a Postgres outbox table + the publisher's locking (`FOR UPDATE SKIP LOCKED`), real transports (a Kafka adapter), timed/exponential backoff, and firing `published`/`dead_lettered` notifications. The `Outbox` (transactional record-and-enqueue) and `levelRouter` (transport-per-level) also live here.
