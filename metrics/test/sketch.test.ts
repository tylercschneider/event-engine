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

  it("merges two sketches into the distinct count of their union", () => {
    const a = new ExactDistinctSketch();
    a.add("u1");
    a.add("u2");
    const b = new ExactDistinctSketch();
    b.add("u2");
    b.add("u3");
    expect(a.merge(b).estimate()).toBe(3);
  });
});
