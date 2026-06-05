import { Level, type Handler, type Subscriber } from "@event-engine/core";
import type { OutboxEvent } from "./outbox";

export class UnsupportedLevelError extends Error {
  constructor(level: Level) {
    super(`delivery does not support level ${String(level)}`);
    this.name = "UnsupportedLevelError";
  }
}

export interface DeliveryDeps {
  subscribersFor: (eventName: string) => Subscriber[];
  outbox: { emit: (event: OutboxEvent) => Promise<void> };
}

export class Delivery {
  constructor(private readonly deps: DeliveryDeps) {}

  handler(): Handler {
    return async (event) => {
      if (event.level === Level.InProcess) {
        for (const subscriber of this.deps.subscribersFor(event.name)) {
          await subscriber(event);
        }
      } else if (event.level === Level.Outbox || event.level === Level.Broker) {
        await this.deps.outbox.emit(event);
      } else if (event.level === Level.EventSourcing) {
        throw new UnsupportedLevelError(event.level);
      }
    };
  }
}
