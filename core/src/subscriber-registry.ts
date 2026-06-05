import type { DispatchedEvent } from "./handler-registry";

export type Subscriber = (event: DispatchedEvent) => void | Promise<void>;

export class SubscriberRegistry {
  private readonly byName = new Map<string, Subscriber[]>();

  subscribe(eventName: string, subscriber: Subscriber): void {
    const subscribers = this.byName.get(eventName) ?? [];
    subscribers.push(subscriber);
    this.byName.set(eventName, subscribers);
  }

  subscribersFor(eventName: string): Subscriber[] {
    return this.byName.get(eventName) ?? [];
  }
}
