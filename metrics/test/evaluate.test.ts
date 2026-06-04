import { describe, it, expect } from "vitest";
import { evaluate } from "../src/evaluate";

describe("evaluate", () => {
  it("evaluates a number literal", () => {
    expect(evaluate("42")).toBe(42);
  });
});
