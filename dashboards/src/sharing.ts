import type { Dashboard } from "./dashboard";

export type Visibility =
  | "private"
  | "in_account"
  | "account_wide"
  | "external";

export interface Principal {
  userId: string;
  accountId: string;
}

export interface SharedDashboard {
  dashboard: Dashboard;
  owner: Principal;
  visibility: Visibility;
  sharedWith?: string[];
}

export function canView(shared: SharedDashboard, viewer: Principal): boolean {
  if (viewer.userId === shared.owner.userId) return true;
  if (shared.visibility === "account_wide") {
    return viewer.accountId === shared.owner.accountId;
  }
  return false;
}
