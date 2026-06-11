import { describe, it, expect } from "vitest";
import {
  scalar,
  resolveInputs,
  InMemoryStatSource,
  type Stat,
} from "../src/index";

describe("@eventengine/stats public api", () => {
  it("narrows a result by its shape through the package entry", () => {
    const result = scalar(7, { asOf: "2026-01-01T00:00:00Z", exact: true });
    const rendered = result.shape === "scalar" ? result.value : 0;
    expect(rendered).toBe(7);
  });

  it("declares a stat and resolves its inputs through the package entry", () => {
    const ActiveUsers: Stat = {
      key: "active_users",
      title: "Active Users",
      definition: "Distinct users active in the timeframe.",
      unit: "count",
      timeframe: "last_30d",
      inputs: {
        region: {
          key: "region",
          required: true,
          validate: (value): value is string => typeof value === "string",
        },
      },
    };
    expect(resolveInputs(ActiveUsers, { region: "us" })).toEqual({
      region: "us",
    });
  });

  it("resolves a declared stat end to end through the package entry", async () => {
    const Revenue: Stat = {
      key: "revenue",
      title: "Revenue",
      definition: "Total revenue for the account.",
      unit: "currency",
      timeframe: "mtd",
      inputs: {
        accountId: {
          key: "accountId",
          required: true,
          validate: (value): value is string => typeof value === "string",
        },
      },
    };
    const source = new InMemoryStatSource();
    source.define("revenue", () =>
      scalar(1200, { asOf: "2026-01-01T00:00:00Z", exact: true }),
    );
    const inputs = resolveInputs(Revenue, { accountId: "a1" });
    const result = await source.resolve(Revenue, inputs);
    expect(result.shape === "scalar" ? result.value : 0).toBe(1200);
  });
});
