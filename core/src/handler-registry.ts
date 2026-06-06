import type { Level } from "./event";

export interface DispatchedEvent {
  name: string;
  level: Level;
  payload: unknown;
  occurredAt: string;
  version?: number;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  aggregateType?: string;
  aggregateId?: string;
  aggregateVersion?: number;
}

export type Handler = (event: DispatchedEvent) => void | Promise<void>;

export type LevelFilter = "all" | readonly Level[];

interface Registration {
  handler: Handler;
  levels: LevelFilter;
}

export class HandlerRegistry {
  private readonly registrations: Registration[] = [];

  register(handler: Handler, levels: LevelFilter): void {
    this.registrations.push({ handler, levels });
  }

  async dispatch(event: DispatchedEvent): Promise<void> {
    for (const registration of this.registrations) {
      if (
        registration.levels === "all" ||
        registration.levels.includes(event.level)
      ) {
        await registration.handler(event);
      }
    }
  }
}
