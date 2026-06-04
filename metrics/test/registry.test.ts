import { describe, it, expect } from "vitest";
import { additive } from "../src/measure";
import { MeasureRegistry, DuplicateMeasureError } from "../src/registry";

describe("MeasureRegistry", () => {
  it("returns a defined measure by key", () => {
    const registry = new MeasureRegistry();
    const points = additive("points", (event) => event.payload as number);
    registry.define(points);
    expect(registry.get("points")).toBe(points);
  });

  it("rejects defining two measures with the same key", () => {
    const registry = new MeasureRegistry();
    registry.define(additive("points", (event) => event.payload as number));
    expect(() =>
      registry.define(additive("points", () => 0)),
    ).toThrow(DuplicateMeasureError);
  });
});
