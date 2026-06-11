import type { StoredEvent } from "@eventengine/store";
import type { Measure } from "./measure";
import { evaluate } from "./evaluate";

export function derived(
  key: string,
  expression: string,
  inputs: Record<string, Measure>,
): Measure {
  return {
    key,
    kind: "derived",
    compute(events: StoredEvent[]) {
      const bindings: Record<string, number> = {};
      for (const [name, measure] of Object.entries(inputs)) {
        bindings[name] = measure.compute(events);
      }
      return evaluate(expression, bindings);
    },
  };
}
