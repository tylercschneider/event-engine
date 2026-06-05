import { describe, it, expect } from "vitest";
import { hidePlacement } from "../src/customize";
import type { Dashboard } from "../src/dashboard";

function makeDashboard(): Dashboard {
  return {
    title: "Overview",
    placements: [
      {
        statKey: "revenue",
        params: {},
        chart: "number",
        layout: { x: 0, y: 0, w: 3, h: 2 },
      },
      {
        statKey: "signups",
        params: {},
        chart: "number",
        layout: { x: 3, y: 0, w: 3, h: 2 },
      },
    ],
  };
}

describe("hidePlacement", () => {
  it("marks the matching placement hidden", () => {
    const next = hidePlacement(makeDashboard(), "revenue");
    expect(
      next.placements.find((placement) => placement.statKey === "revenue")
        ?.hidden,
    ).toBe(true);
  });
});
