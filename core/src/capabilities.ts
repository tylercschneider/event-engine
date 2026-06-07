import { Level } from "./level";

export interface Capabilities {
  backgrounded: boolean;
  durable: boolean;
  broker: boolean;
}

const CAPABILITIES: Record<Level, Capabilities> = {
  [Level.InProcess]: { backgrounded: false, durable: false, broker: false },
  [Level.Background]: { backgrounded: true, durable: false, broker: false },
  [Level.Outbox]: { backgrounded: true, durable: true, broker: false },
  [Level.Broker]: { backgrounded: true, durable: true, broker: true },
  [Level.EventSourcing]: { backgrounded: false, durable: false, broker: false },
};

export function capabilitiesFor(level: Level): Capabilities {
  return CAPABILITIES[level];
}
