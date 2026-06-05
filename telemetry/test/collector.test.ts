import { describe, it, expect } from "vitest";
import { Collector, type Signal, type Sink } from "../src/collector";

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

const signal: Signal = { name: "page.view", occurredAt: "t", payload: {} };

describe("Collector", () => {
  it("does not write before the batch size is reached", async () => {
    const { batches, sink } = recordingSink();
    const collector = new Collector(sink, 3);
    await collector.collect(signal);
    await collector.collect(signal);
    expect(batches).toEqual([]);
  });
});
