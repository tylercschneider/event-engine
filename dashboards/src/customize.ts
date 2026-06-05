import type { Dashboard, Placement } from "./dashboard";

function mapPlacement(
  dashboard: Dashboard,
  statKey: string,
  transform: (placement: Placement) => Placement,
): Dashboard {
  return {
    ...dashboard,
    placements: dashboard.placements.map((placement) =>
      placement.statKey === statKey ? transform(placement) : placement,
    ),
  };
}

export function hidePlacement(dashboard: Dashboard, statKey: string): Dashboard {
  return mapPlacement(dashboard, statKey, (placement) => ({
    ...placement,
    hidden: true,
  }));
}

export function setFilter(
  dashboard: Dashboard,
  statKey: string,
  params: Record<string, unknown>,
): Dashboard {
  return mapPlacement(dashboard, statKey, (placement) => ({
    ...placement,
    params,
  }));
}
