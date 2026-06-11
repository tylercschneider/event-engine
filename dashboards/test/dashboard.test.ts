import { describe, it, expect } from "vitest";
import { scalar } from "@eventengine/stats";
import {
  resolveDashboard,
  type Dashboard,
  type DataProvider,
} from "../src/dashboard";

const numberProvider: DataProvider = {
  async resolve(statKey) {
    return scalar(statKey === "revenue" ? 100 : 0, { asOf: "t", exact: true });
  },
};

describe("resolveDashboard", () => {
  it("resolves each placement's stat into a result", async () => {
    const dashboard: Dashboard = {
      title: "Overview",
      placements: [
        {
          statKey: "revenue",
          params: {},
          chart: "number",
          layout: { x: 0, y: 0, w: 3, h: 2 },
        },
      ],
    };
    const resolved = await resolveDashboard(dashboard, numberProvider);
    expect(resolved.placements[0]?.result).toEqual(
      scalar(100, { asOf: "t", exact: true }),
    );
  });

  it("skips hidden placements", async () => {
    const dashboard: Dashboard = {
      title: "Overview",
      placements: [
        {
          statKey: "revenue",
          params: {},
          chart: "number",
          layout: { x: 0, y: 0, w: 3, h: 2 },
          hidden: true,
        },
      ],
    };
    const resolved = await resolveDashboard(dashboard, numberProvider);
    expect(resolved.placements).toEqual([]);
  });
});
