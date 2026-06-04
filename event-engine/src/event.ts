import { z, type ZodType } from "zod";

export enum Level {
  Telemetry = 0,
  InProcess = 1,
  Outbox = 2,
  Retry = 3,
  Broker = 4,
}

interface EventSpec<Name extends string, Schema extends ZodType> {
  name: Name;
  version: number;
  level: Level;
  schema: Schema;
}

export function defineEvent<Name extends string, Schema extends ZodType>(
  spec: EventSpec<Name, Schema>,
) {
  return {
    build(_input: z.input<Schema>, _occurredAt: string) {
      return { name: spec.name };
    },
  };
}
