export type NotificationListener<Payload> = (payload: Payload) => void;

export class Notifications<Channels extends Record<string, unknown>> {
  private readonly listeners = new Map<
    keyof Channels,
    NotificationListener<unknown>[]
  >();

  on<Channel extends keyof Channels>(
    channel: Channel,
    listener: NotificationListener<Channels[Channel]>,
  ): void {
    const existing = this.listeners.get(channel) ?? [];
    existing.push(listener as NotificationListener<unknown>);
    this.listeners.set(channel, existing);
  }

  emit<Channel extends keyof Channels>(
    channel: Channel,
    payload: Channels[Channel],
  ): void {
    for (const listener of this.listeners.get(channel) ?? []) {
      (listener as NotificationListener<Channels[Channel]>)(payload);
    }
  }
}
