import type { Level } from "@eventengine/core";
import type { OutboxEvent, Transport } from "./outbox";

export class UnroutableLevelError extends Error {
  constructor(level: Level | undefined) {
    super(`no transport registered for level ${String(level)}`);
    this.name = "UnroutableLevelError";
  }
}

export function levelRouter(routes: Map<Level, Transport>): Transport {
  return async (event: OutboxEvent) => {
    const transport =
      event.level !== undefined ? routes.get(event.level) : undefined;
    if (!transport) throw new UnroutableLevelError(event.level);
    await transport(event);
  };
}
