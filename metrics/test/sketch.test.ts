import { describe, it, expect } from "vitest";
import { ExactDistinctSketch } from "../src/sketch";

describe("ExactDistinctSketch", () => {
  it("estimates the number of distinct added keys", () => {
    const sketch = new ExactDistinctSketch();
    sketch.add("u1");
    sketch.add("u2");
    sketch.add("u1");
    expect(sketch.estimate()).toBe(2);
  });
});
