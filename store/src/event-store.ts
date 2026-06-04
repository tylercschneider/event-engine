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
    const events: StoredEvent[] = [];
    let cursor: string | null = null;
    do {
      const page = await this.log.readFrom(cursor, 100);
      events.push(...page.rows);
      cursor = page.next;
    } while (cursor !== null);
    return events;
  }
}
