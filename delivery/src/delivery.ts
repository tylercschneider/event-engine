import { Level, type Handler, type Subscriber } from "@event-engine/core";
import type { OutboxEvent } from "./outbox";

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
      }
    };
  }
}
