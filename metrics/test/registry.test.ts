import { describe, it, expect } from "vitest";
import { additive } from "../src/measure";
import { MeasureRegistry } from "../src/registry";

describe("MeasureRegistry", () => {
  it("returns a defined measure by key", () => {
    const registry = new MeasureRegistry();
    const points = additive("points", (event) => event.payload as number);
    registry.define(points);
    expect(registry.get("points")).toBe(points);
  });
});
