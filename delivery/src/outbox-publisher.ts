import type { OutboxStore } from "./outbox-store";
import type { Transport } from "./outbox";

export interface PublisherDeps {
  store: OutboxStore;
  transport: Transport;
}

export class OutboxPublisher {
  constructor(private readonly deps: PublisherDeps) {}

  async publish(): Promise<void> {
    for (const record of this.deps.store.pending()) {
      try {
        await this.deps.transport(record.event);
        this.deps.store.markPublished(record.id);
      } catch (error) {
        this.deps.store.markDeadLettered(record.id, String(error));
      }
    }
  }
}
