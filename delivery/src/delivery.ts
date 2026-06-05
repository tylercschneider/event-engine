import {
  Level,
  type Handler,
  type Subscriber,
  type DispatchedEvent,
} from "@event-engine/core";
import type { JobQueue } from "@event-engine/ports";
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
  jobs?: JobQueue;
}

export class Delivery {
  constructor(private readonly deps: DeliveryDeps) {
    this.deps.jobs?.process<DispatchedEvent>("dispatch-subscribers", (event) =>
      this.dispatchSubscribers(event),
    );
  }

  private async dispatchSubscribers(event: DispatchedEvent): Promise<void> {
    for (const subscriber of this.deps.subscribersFor(event.name)) {
      await subscriber(event);
    }
  }

  handler(): Handler {
    return async (event) => {
      if (event.level === Level.InProcess) {
        await this.dispatchSubscribers(event);
      } else if (event.level === Level.Background) {
        await this.deps.jobs?.enqueue<DispatchedEvent>({
          name: "dispatch-subscribers",
          payload: event,
        });
      } else if (event.level === Level.Outbox || event.level === Level.Broker) {
        await this.deps.outbox.emit(event);
      } else if (event.level === Level.EventSourcing) {
        throw new UnsupportedLevelError(event.level);
      }
    };
  }
}
