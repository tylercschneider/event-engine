import { describe, it, expect } from "vitest";
import {
  InMemoryStatSource,
  resolveInputs,
  scalar,
  type Stat,
} from "@stats/stats";
import {
  resolveDashboard,
  type Dashboard,
  type DataProvider,
} from "../src/index";

describe("@stats/dashboards public api", () => {
  it("resolves a dashboard whose provider is backed by a stat source", async () => {
    const Revenue: Stat = {
      key: "revenue",
      title: "Revenue",
      definition: "Total revenue.",
      unit: "currency",
      timeframe: "mtd",
      inputs: {},
    };
    const source = new InMemoryStatSource();
    source.define("revenue", () => scalar(4200, { asOf: "t", exact: true }));

    const catalog: Record<string, Stat> = { revenue: Revenue };
    const provider: DataProvider = {
      async resolve(statKey, params) {
        const stat = catalog[statKey]!;
        return source.resolve(stat, resolveInputs(stat, params));
      },
    };

    const dashboard: Dashboard = {
      title: "Money",
      placements: [
        {
          statKey: "revenue",
          params: {},
          chart: "number",
          layout: { x: 0, y: 0, w: 3, h: 2 },
        },
      ],
    };
    const resolved = await resolveDashboard(dashboard, provider);
    expect(resolved.placements[0]?.result).toEqual(
      scalar(4200, { asOf: "t", exact: true }),
    );
  });
});
