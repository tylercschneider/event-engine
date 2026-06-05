import { describe, it, expect } from "vitest";
import {
  InMemoryStatSource,
  resolveInputs,
  scalar,
  type Stat,
} from "@event-engine/stats";
import {
  resolveDashboard,
  setFilter,
  canView,
  type Dashboard,
  type DataProvider,
  type SharedDashboard,
} from "../src/index";

describe("@event-engine/dashboards public api", () => {
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

  it("applies a saved filter then resolves it through the package entry", async () => {
    const seen: Record<string, unknown>[] = [];
    const provider: DataProvider = {
      async resolve(_statKey, params) {
        seen.push(params);
        return scalar(1, { asOf: "t", exact: true });
      },
    };
    const dashboard: Dashboard = {
      title: "Filtered",
      placements: [
        {
          statKey: "revenue",
          params: {},
          chart: "number",
          layout: { x: 0, y: 0, w: 3, h: 2 },
        },
      ],
    };
    const filtered = setFilter(dashboard, "revenue", { region: "us" });
    await resolveDashboard(filtered, provider);
    expect(seen).toEqual([{ region: "us" }]);
  });

  it("denies a stranger access to a private dashboard through the package entry", () => {
    const shared: SharedDashboard = {
      dashboard: { title: "Secret", placements: [] },
      owner: { userId: "owner", accountId: "acct" },
      visibility: "private",
    };
    expect(canView(shared, { userId: "stranger", accountId: "other" })).toBe(
      false,
    );
  });
});
