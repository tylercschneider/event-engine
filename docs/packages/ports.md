# @event-engine/ports

The substrate the Ruby version gets from Rails. TypeScript has no default ORM, ambient transaction, or job queue, so these are small interfaces with in-memory reference adapters. Every DB/job-bound package binds through them, and a production adapter (Postgres, BullMQ) slots in behind the same shape.

## The three port families

### Storage

```ts
interface KeyedStore<Id, Entity> {
  get(id): Promise<Entity | null>;
  put(id, entity): Promise<void>;
  delete(id): Promise<void>;
}

interface AppendOnlyStore<Row> {
  append(row): Promise<void>;
  readFrom(cursor: string | null, limit: number): Promise<{ rows: Row[]; next: string | null }>;
}
```
Reference adapters: `InMemoryKeyedStore`, `InMemoryAppendOnlyStore`.

### Transactions

```ts
interface TransactionManager {
  run<T>(work: (tx: Transaction) => Promise<T>): Promise<T>;
  current(): Transaction | null;
}
```
`InMemoryTransactionManager` uses `AsyncLocalStorage` so code deep in the stack can enlist in the active transaction via `current()` without it being threaded through every call — the mechanic the transactional outbox needs.

### Jobs

```ts
interface JobQueue {
  enqueue<P>(job: { name: string; payload: P }): Promise<void>;
  process<P>(name: string, handler: (payload: P) => Promise<void>): void;
}
```
`InlineJobQueue` runs handlers synchronously on enqueue — the right default for tests and level-1 delivery; a Postgres- or BullMQ-backed adapter would back level 2+.

## Status

Interfaces are real; only in-memory/inline reference adapters exist today. Postgres / BullMQ / Kafka adapters are the main "make it real" gap.
