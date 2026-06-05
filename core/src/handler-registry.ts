import type { Level } from "./event";

export interface DispatchedEvent {
  name: string;
  level: Level;
  payload: unknown;
  occurredAt: string;
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
      await registration.handler(event);
    }
  }
}
