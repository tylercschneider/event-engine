import type { Notifications } from "@event-engine/core";
import type { OutboxStore, OutboxRecord } from "./outbox-store";
import type { Transport } from "./outbox";

export type DeliveryChannels = {
  published: OutboxRecord;
  dead_lettered: OutboxRecord;
};

export interface PublisherDeps {
  store: OutboxStore;
  transport: Transport;
  notifications?: Notifications<DeliveryChannels>;
}

export class OutboxPublisher {
  constructor(private readonly deps: PublisherDeps) {}

  async publish(): Promise<void> {
    for (const record of this.deps.store.pending()) {
      try {
        await this.deps.transport(record.event);
        this.deps.store.markPublished(record.id);
        this.deps.notifications?.emit("published", record);
      } catch (error) {
        this.deps.store.markDeadLettered(record.id, String(error));
      }
    }
  }
}
