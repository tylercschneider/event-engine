import { Level } from "./level";

export type DeliveryPreset = "inline" | "background" | "durable" | "broker";

const LEVELS: Record<DeliveryPreset, Level> = {
  inline: Level.InProcess,
  background: Level.Background,
  durable: Level.Outbox,
  broker: Level.Broker,
};

export function levelForPreset(preset: DeliveryPreset): Level {
  return LEVELS[preset];
}
