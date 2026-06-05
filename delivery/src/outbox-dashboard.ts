import type { OutboxStore, OutboxRecord } from "./outbox-store";

export class OutboxDashboard {
  constructor(private readonly store: OutboxStore) {}

  summary(): ReturnType<OutboxStore["counts"]> {
    return this.store.counts();
  }

  events(page = 1, perPage = 20): OutboxRecord[] {
    const start = (page - 1) * perPage;
    return this.store.list().slice(start, start + perPage);
  }

  deadLetters(): OutboxRecord[] {
    return this.store.deadLetters();
  }
}
