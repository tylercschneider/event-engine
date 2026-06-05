import { describe, it, expect } from "vitest";
import { ColumnarSink } from "../src/columnar-sink";

describe("ColumnarSink", () => {
  it("lays a written batch out by column", () => {
    const sink = new ColumnarSink();
    sink.write([
      { name: "click", occurredAt: "t1", payload: 1 },
      { name: "view", occurredAt: "t2", payload: 2 },
    ]);
    expect(sink.columns).toEqual({
      name: ["click", "view"],
      occurredAt: ["t1", "t2"],
      payload: [1, 2],
    });
  });

  it("accumulates across multiple batches", () => {
    const sink = new ColumnarSink();
    sink.write([{ name: "a", occurredAt: "t1", payload: 1 }]);
    sink.write([{ name: "b", occurredAt: "t2", payload: 2 }]);
    expect(sink.columns.name).toEqual(["a", "b"]);
  });
});
