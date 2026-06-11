# event-engine — documentation

Composable TypeScript packages for **event capture, data management, and stat display** — a faithful TypeScript port of the Ruby `event_engine` family.

> Don't collect "stats" — collect **events** (immutable facts, values frozen at the moment they happened), then derive every stat from them.

## Start here

- **[Architecture](./architecture.md)** — how the whole thing works: the `define → emit → dispatch → handlers` spine, the level ladder, the Event envelope, and how the packages compose.
- **[Getting started](./getting-started.md)** — wire an `EventEngine`, define an event, emit it, and watch the store record it and delivery route it.

## The packages

Each package owns one job and depends only on the ones below it, so you adopt them incrementally and never pull in machinery you don't use.

| Package | Stage | Doc |
|---|---|---|
| [`@eventengine/core`](./packages/core.md) | foundation | define events, the emit/dispatch spine, the registries, notifications |
| [`@eventengine/ports`](./packages/ports.md) | substrate | storage / transaction / job-queue ports + reference adapters |
| [`@eventengine/store`](./packages/store.md) | data | the append-only event record, projections, replay |
| [`@eventengine/delivery`](./packages/delivery.md) | capture | reliable delivery: level routing, the outbox, the publisher, the dashboard |
| [`@eventengine/telemetry`](./packages/telemetry.md) | capture | the high-volume anonymous sink |
| [`@eventengine/metrics`](./packages/metrics.md) | data | aggregation: measures, rollups, sketches, the expression DSL |
| [`@eventengine/stats`](./packages/stats.md) | display | the self-describing, source-agnostic stat contract |
| [`@eventengine/dashboards`](./packages/dashboards.md) | display | headless dashboards-as-data |

## Status

This is a reference implementation on in-memory adapters: the architecture, contracts, and behavior are real and TDD-tested, but production adapters (Postgres, Kafka, a real job queue) are pending. See each package doc for what's real vs. reference.
