import { Collector, type Signal } from "./collector";

export interface CollectResult {
  accepted: number;
}

export function collectorHandler(
  collector: Collector,
): (body: unknown) => Promise<CollectResult> {
  return async (body) => {
    const signals = body as Signal[];
    for (const signal of signals) await collector.collect(signal);
    return { accepted: signals.length };
  };
}
