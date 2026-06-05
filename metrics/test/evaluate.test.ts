import { describe, it, expect } from "vitest";
import {
  evaluate,
  UnknownVariableError,
  ExpressionError,
} from "../src/evaluate";

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

  it("multiplies before adding", () => {
    expect(evaluate("2 + 3 * 4")).toBe(14);
  });

  it("subtracts terms", () => {
    expect(evaluate("10 - 3")).toBe(7);
  });

  it("divides factors", () => {
    expect(evaluate("12 / 4")).toBe(3);
  });

  it("evaluates parenthesised groups first", () => {
    expect(evaluate("(2 + 3) * 4")).toBe(20);
  });

  it("throws UnknownVariableError for an unbound variable", () => {
    expect(() => evaluate("missing + 1")).toThrow(UnknownVariableError);
  });

  it("rejects trailing tokens after a complete expression", () => {
    expect(() => evaluate("1 2")).toThrow(ExpressionError);
  });

  it("rejects an unclosed parenthesis", () => {
    expect(() => evaluate("(1 + 2")).toThrow(ExpressionError);
  });

  it("rejects an empty expression", () => {
    expect(() => evaluate("")).toThrow(ExpressionError);
  });
});
