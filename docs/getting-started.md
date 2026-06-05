# Getting started

This walks through the core flow end to end: define an event, wire an `EventEngine` with the store and delivery handlers, and emit.

## 1. Define an event

```ts
import { z } from "zod";
import { defineEvent, Level } from "@event-engine/core";

export const InvoicePaid = defineEvent({
  name: "invoice.paid",
  version: 1,
  level: Level.Outbox, // durable
  schema: z.object({ amountCents: z.number().int().nonnegative() }),
});
```

You get runtime validation **and** a static payload type from this one declaration — `build`'s input is typed `{ amountCents: number }`, and bad input throws.

## 2. Wire the engine + handlers

```ts
import { EventEngine } from "@event-engine/core";
import { InMemoryAppendOnlyStore } from "@event-engine/ports";
import { EventStore, type StoredEvent } from "@event-engine/store";

const engine = new EventEngine();

// store: record every event, then run projections
const store = new EventStore(new InMemoryAppendOnlyStore<StoredEvent>());
engine.registerHandler(store.recorder(), "all");
engine.registerHandler(store.projectionDispatcher(), "all");

// a projection (any function of the event)
store.subscribe((event) => console.log("projected", event.name));
```

## 3. Emit

```ts
await engine.emit(InvoicePaid, { amountCents: 1999 }, new Date().toISOString());
// -> recorded to the store, then projected
const recorded = await store.all(); // [{ name: "invoice.paid", ... }]
```

## 4. Add reliable delivery (level routing)

```ts
import {
  Delivery,
  Outbox,
  OutboxStore,
  OutboxPublisher,
  OutboxDashboard,
} from "@event-engine/delivery";
import { InlineJobQueue, InMemoryTransactionManager } from "@event-engine/ports";

const outboxStore = new OutboxStore();
const transport = (event) => publishToBroker(event); // your transport

const delivery = new Delivery({
  subscribersFor: (name) => engine.subscribersFor(name), // level 1
  outbox: { emit: async (event) => { outboxStore.record(event); } }, // level 3/4
  jobs: new InlineJobQueue(), // level 2
});
engine.registerHandler(delivery.handler(), "all");

// drain the outbox through the transport
await new OutboxPublisher({ store: outboxStore, transport }).publish();

// observe + recover
const dashboard = new OutboxDashboard(outboxStore);
dashboard.summary();   // { total, pending, published, deadLettered }
dashboard.deadLetters();
dashboard.retryAll();
```

## 5. Observe everything

```ts
engine.notifications.on("emitted", (event) => metrics.increment("emitted", event.name));
```

## Where to go next

- [Architecture](./architecture.md) for the full picture.
- The per-package docs (linked from the [index](./README.md)) for each piece's API.
