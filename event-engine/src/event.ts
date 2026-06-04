import { createHash } from "node:crypto";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { z, ZodType } from "zod";

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
  const shape = JSON.stringify(zodToJsonSchema(spec.schema));
  const fingerprint = createHash("sha256")
    .update(`${spec.name}:${shape}`)
    .digest("hex");

  return {
    name: spec.name,
    fingerprint,
    build(input: z.input<Schema>, occurredAt: string) {
      return {
        name: spec.name,
        level: spec.level,
        payload: Object.freeze(spec.schema.parse(input)) as Readonly<z.output<Schema>>,
        occurredAt,
      };
    },
  };
}
