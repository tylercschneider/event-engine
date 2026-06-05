import { describe, it, expect } from "vitest";
import { evaluate } from "../src/evaluate";

describe("evaluate", () => {
  it("evaluates a number literal", () => {
    expect(evaluate("42")).toBe(42);
  });

  it("resolves a variable from the bindings", () => {
    expect(evaluate("revenue", { revenue: 100 })).toBe(100);
  });

  it("adds two terms", () => {
    expect(evaluate("1 + 2")).toBe(3);
  });
});
