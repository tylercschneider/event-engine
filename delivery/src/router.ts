import type { Level } from "@stats/event-engine";
import type { OutboxEvent, Transport } from "./outbox";

export function levelRouter(routes: Map<Level, Transport>): Transport {
  return async (event: OutboxEvent) => {
    const transport =
      event.level !== undefined ? routes.get(event.level) : undefined;
    if (transport) await transport(event);
  };
}
