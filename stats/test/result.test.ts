import { describe, it, expect } from "vitest";
import { scalar, series } from "../src/result";

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

describe("series", () => {
  it("builds a series result carrying the points and metadata", () => {
    const result = series([{ t: "2026-01-01", v: 5 }], {
      asOf: "2026-01-02T00:00:00Z",
      exact: false,
    });
    expect(result).toEqual({
      shape: "series",
      value: [{ t: "2026-01-01", v: 5 }],
      asOf: "2026-01-02T00:00:00Z",
      exact: false,
    });
  });
});
