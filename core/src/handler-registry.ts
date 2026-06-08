import type { Level } from "./event";
import type { Capabilities } from "./capabilities";
import type { ProcessType } from "./process-type";

export interface DispatchedEvent {
  name: string;
  eventId?: string;
  type?: string;
  processType?: ProcessType;
  level?: Level;
  capabilities?: Capabilities;
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
        (event.level !== undefined && registration.levels.includes(event.level))
      ) {
        await registration.handler(event);
      }
    }
  }
}
