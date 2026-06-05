import { describe, it, expect } from "vitest";
import { Collector, type Signal, type Sink } from "../src/collector";
import { collectorHandler, InvalidPayloadError } from "../src/handler";

function recordingSink(): { batches: Signal[][]; sink: Sink } {
  const batches: Signal[][] = [];
  return {
    batches,
    sink: {
      write(batch) {
        batches.push(batch);
      },
    },
  };
}

describe("collectorHandler", () => {
  it("collects each signal in the body and reports the accepted count", async () => {
    const { sink } = recordingSink();
    const handle = collectorHandler(new Collector(sink, 1));
    const result = await handle([
      { name: "click", occurredAt: "t", payload: {} },
      { name: "click", occurredAt: "t", payload: {} },
    ]);
    expect(result.accepted).toBe(2);
  });

  it("rejects a body that is not an array", async () => {
    const { sink } = recordingSink();
    const handle = collectorHandler(new Collector(sink, 1));
    let caught: unknown;
    try {
      await handle({ not: "an array" });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(InvalidPayloadError);
  });
});
