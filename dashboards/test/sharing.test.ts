import { describe, it, expect } from "vitest";
import {
  canView,
  type SharedDashboard,
  type Visibility,
} from "../src/sharing";
import type { Dashboard } from "../src/dashboard";

const dashboard: Dashboard = { title: "Overview", placements: [] };

function shared(visibility: Visibility, sharedWith?: string[]): SharedDashboard {
  return {
    dashboard,
    owner: { userId: "owner", accountId: "acct" },
    visibility,
    sharedWith,
  };
}

describe("canView", () => {
  it("lets the owner view a private dashboard", () => {
    expect(
      canView(shared("private"), { userId: "owner", accountId: "acct" }),
    ).toBe(true);
  });

  it("lets a same-account member view an account-wide dashboard", () => {
    expect(
      canView(shared("account_wide"), { userId: "other", accountId: "acct" }),
    ).toBe(true);
  });
});
