import { Collector, type Signal } from "./collector";

export interface CollectResult {
  accepted: number;
}

export class InvalidPayloadError extends Error {
  constructor() {
    super("telemetry payload must be an array of signals");
    this.name = "InvalidPayloadError";
  }
}

export function collectorHandler(
  collector: Collector,
): (body: unknown) => Promise<CollectResult> {
  return async (body) => {
    if (!Array.isArray(body)) throw new InvalidPayloadError();
    const signals = body as Signal[];
    for (const signal of signals) await collector.collect(signal);
    return { accepted: signals.length };
  };
}
