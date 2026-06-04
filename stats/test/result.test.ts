import { describe, it, expect } from "vitest";
import { scalar } from "../src/result";

describe("scalar", () => {
  it("builds a scalar result carrying the value and metadata", () => {
    const result = scalar(42, { asOf: "2026-01-01T00:00:00Z", exact: true });
    expect(result).toEqual({
      shape: "scalar",
      value: 42,
      asOf: "2026-01-01T00:00:00Z",
      exact: true,
    });
  });
});
