import { describe, it, expect } from "vitest";
import { scalar } from "../src/index";

describe("@stats/stats public api", () => {
  it("narrows a result by its shape through the package entry", () => {
    const result = scalar(7, { asOf: "2026-01-01T00:00:00Z", exact: true });
    const rendered = result.shape === "scalar" ? result.value : 0;
    expect(rendered).toBe(7);
  });
});
