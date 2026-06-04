import type { AppendOnlyStore } from "@stats/ports";

export interface StoredEvent {
  name: string;
  occurredAt: string;
  payload: unknown;
}

export class EventStore {
  constructor(private readonly log: AppendOnlyStore<StoredEvent>) {}

  async append(event: StoredEvent): Promise<void> {
    await this.log.append(event);
  }

  async all(): Promise<StoredEvent[]> {
    const page = await this.log.readFrom(null, 100);
    return page.rows;
  }
}
