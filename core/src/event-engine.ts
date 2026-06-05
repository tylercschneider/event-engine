import {
  HandlerRegistry,
  type Handler,
  type LevelFilter,
  type DispatchedEvent,
} from "./handler-registry";
import { SubscriberRegistry, type Subscriber } from "./subscriber-registry";
import type { BuildOptions } from "./event";

interface Emittable<Input> {
  build(
    input: Input,
    occurredAt: string,
    options?: BuildOptions,
  ): DispatchedEvent;
}

export class EventEngine {
  private readonly handlers = new HandlerRegistry();
  private readonly subscribers = new SubscriberRegistry();

  registerHandler(handler: Handler, levels: LevelFilter): void {
    this.handlers.register(handler, levels);
  }

  subscribe(eventName: string, subscriber: Subscriber): void {
    this.subscribers.subscribe(eventName, subscriber);
  }

  subscribersFor(eventName: string): Subscriber[] {
    return this.subscribers.subscribersFor(eventName);
  }

  async emit<Input>(
    definition: Emittable<Input>,
    input: Input,
    occurredAt: string,
    options?: BuildOptions,
  ): Promise<DispatchedEvent> {
    const event = definition.build(input, occurredAt, options);
    await this.handlers.dispatch(event);
    return event;
  }
}
