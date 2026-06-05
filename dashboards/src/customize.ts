import type { Dashboard } from "./dashboard";

export function hidePlacement(dashboard: Dashboard, statKey: string): Dashboard {
  for (const placement of dashboard.placements) {
    if (placement.statKey === statKey) placement.hidden = true;
  }
  return dashboard;
}
