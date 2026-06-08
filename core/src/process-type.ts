import { Level } from "./level";

export type ProcessType =
  | "inline"
  | "background"
  | "durable"
  | "broker"
  | "telemetry"
  | "sourced";

const LEVELS: Record<ProcessType, Level> = {
  inline: Level.InProcess,
  background: Level.Background,
  durable: Level.Outbox,
  broker: Level.Broker,
  telemetry: Level.InProcess,
  sourced: Level.InProcess,
};

export function levelForProcessType(processType: ProcessType): Level {
  return LEVELS[processType];
}
