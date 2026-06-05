import type { AppendOnlyStore } from "@event-engine/ports";
import type { Handler } from "@event-engine/core";

export interface StoredEvent {
  name: string;
  occurredAt: string;
  payload: unknown;
}

export type Projection = (event: StoredEvent) => void | Promise<void>;

export type ProjectionErrorHandler = (
  error: unknown,
  event: StoredEvent,
) => void;

export class EventStore {
  private readonly projections: Projection[] = [];

  constructor(
    private readonly log: AppendOnlyStore<StoredEvent>,
    private readonly onProjectionError: ProjectionErrorHandler = () => undefined,
  ) {}

  subscribe(projection: Projection): void {
    this.projections.push(projection);
  }

  async append(event: StoredEvent): Promise<void> {
    await this.log.append(event);
  }

  recorder(): Handler {
    return (event) => this.append(event);
  }

  projectionDispatcher(): Handler {
    return async (event) => {
      for (const projection of this.projections) {
        try {
          await projection(event);
        } catch (error) {
          this.onProjectionError(error, event);
        }
      }
    };
  }

  async replay(projection: Projection): Promise<void> {
    for (const event of await this.all()) await projection(event);
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
