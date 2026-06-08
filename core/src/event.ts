import { createHash, randomUUID } from "node:crypto";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { z, ZodType } from "zod";
import { capabilitiesFor } from "./capabilities";
import { Level } from "./level";
import { levelForProcessType, type ProcessType } from "./process-type";

export { Level };

interface EventSpec<Name extends string, Schema extends ZodType> {
  name: Name;
  type?: string;
  version: number;
  processType: ProcessType;
  schema: Schema;
}

export interface BuildOptions {
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  aggregateType?: string;
  aggregateId?: string;
  aggregateVersion?: number;
}

export function defineEvent<Name extends string, Schema extends ZodType>(
  spec: EventSpec<Name, Schema>,
) {
  const jsonSchema = JSON.stringify(zodToJsonSchema(spec.schema));
  const fingerprint = createHash("sha256")
    .update(`${spec.name}:${spec.version}:${jsonSchema}`)
    .digest("hex");
  const shape = createHash("sha256")
    .update(`${spec.name}:${jsonSchema}`)
    .digest("hex");

  const level = levelForProcessType(spec.processType);

  return {
    name: spec.name,
    fingerprint,
    shape,
    build(
      input: z.input<Schema>,
      occurredAt: string,
      options: BuildOptions = {},
    ) {
      return {
        eventId: randomUUID(),
        name: spec.name,
        type: spec.type ?? spec.name,
        version: spec.version,
        processType: spec.processType,
        level,
        capabilities: capabilitiesFor(level),
        payload: Object.freeze(spec.schema.parse(input)) as Readonly<z.output<Schema>>,
        occurredAt,
        metadata: options.metadata ?? {},
        idempotencyKey: options.idempotencyKey,
        aggregateType: options.aggregateType,
        aggregateId: options.aggregateId,
        aggregateVersion: options.aggregateVersion,
      };
    },
  };
}
