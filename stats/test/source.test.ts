import { describe, it, expect } from "vitest";
import { InMemoryStatSource, UnknownStatError } from "../src/source";
import { scalar } from "../src/result";
import type { Stat } from "../src/stat";

const Revenue: Stat = {
  key: "revenue",
  title: "Revenue",
  definition: "Total revenue for the account.",
  unit: "currency",
  timeframe: "mtd",
  inputs: {},
};

describe("InMemoryStatSource", () => {
  it("resolves a stat through its registered resolver", async () => {
    const source = new InMemoryStatSource();
    source.define("revenue", () =>
      scalar(500, { asOf: "2026-01-01T00:00:00Z", exact: true }),
    );
    const result = await source.resolve(Revenue, {});
    expect(result).toEqual(
      scalar(500, { asOf: "2026-01-01T00:00:00Z", exact: true }),
    );
  });

  it("throws UnknownStatError for a stat with no registered resolver", async () => {
    const source = new InMemoryStatSource();
    let caught: unknown;
    try {
      await source.resolve(Revenue, {});
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(UnknownStatError);
  });
});
