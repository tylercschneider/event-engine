import {
  type Handler,
  type Subscriber,
  type DispatchedEvent,
} from "@event-engine/core";
import type { JobQueue } from "@event-engine/ports";
import type { OutboxEvent } from "./outbox";

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
      const processType = event.processType;
      if (processType === "durable" || processType === "broker") {
        await this.deps.outbox.emit(event);
      } else if (processType === "background") {
        await this.deps.jobs?.enqueue<DispatchedEvent>({
          name: "dispatch-subscribers",
          payload: event,
        });
      } else if (processType === "inline") {
        await this.dispatchSubscribers(event);
      }
    };
  }
}
