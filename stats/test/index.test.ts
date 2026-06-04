import { describe, it, expect } from "vitest";
import { scalar, resolveInputs, type Stat } from "../src/index";

describe("@stats/stats public api", () => {
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
});
