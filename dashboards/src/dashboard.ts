import type { StatResult } from "@stats/stats";

export interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Placement {
  statKey: string;
  params: Record<string, unknown>;
  chart: string;
  layout: Layout;
  hidden?: boolean;
}

export interface Dashboard {
  title: string;
  placements: Placement[];
}

export interface DataProvider {
  resolve(
    statKey: string,
    params: Record<string, unknown>,
  ): Promise<StatResult>;
}

export interface ResolvedPlacement {
  statKey: string;
  chart: string;
  layout: Layout;
  result: StatResult;
}

export interface ResolvedDashboard {
  title: string;
  placements: ResolvedPlacement[];
}

export async function resolveDashboard(
  dashboard: Dashboard,
  provider: DataProvider,
): Promise<ResolvedDashboard> {
  const placements: ResolvedPlacement[] = [];
  for (const placement of dashboard.placements) {
    if (placement.hidden) continue;
    const result = await provider.resolve(placement.statKey, placement.params);
    placements.push({
      statKey: placement.statKey,
      chart: placement.chart,
      layout: placement.layout,
      result,
    });
  }
  return { title: dashboard.title, placements };
}
