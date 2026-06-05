import type { OutboxStore } from "./outbox-store";

export class OutboxDashboard {
  constructor(private readonly store: OutboxStore) {}

  summary(): ReturnType<OutboxStore["counts"]> {
    return this.store.counts();
  }
}
