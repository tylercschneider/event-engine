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

export function reorderPlacements(
  dashboard: Dashboard,
  order: string[],
): Dashboard {
  const byKey = new Map(
    dashboard.placements.map((placement) => [placement.statKey, placement]),
  );
  const placements = order
    .map((statKey) => byKey.get(statKey))
    .filter((placement): placement is Placement => placement !== undefined);
  return { ...dashboard, placements };
}
