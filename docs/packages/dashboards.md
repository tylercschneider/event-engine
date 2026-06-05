# @event-engine/dashboards

Headless **dashboards-as-data**. It owns the dashboard config and resolves it into plain JSON; it renders nothing. Every frontend (React/Vue/Svelte/vanilla) consumes the same resolved data with its own components and styling.

This is the deliberate TypeScript answer to "frontends are variable": the package stops at the data line.

## The config

```ts
const dashboard: Dashboard = {
  title: "Revenue Overview",
  placements: [
    { statKey: "monthly_revenue", params: {}, chart: "number", layout: { x: 0, y: 0, w: 3, h: 2 } },
    { statKey: "revenue_by_month", params: {}, chart: "line", layout: { x: 3, y: 0, w: 9, h: 4 } },
  ],
};
```

`chart` is a **hint string** (`"number"`, `"line"`, …), not a component — the seam where the frontend maps `(chart hint + result.shape)` to its own UI.

## Resolve

```ts
const provider: DataProvider = { resolve: (statKey, params) => statSource.resolve(catalog[statKey], params) };
const resolved = await resolveDashboard(dashboard, provider);
// { title, placements: [{ statKey, chart, layout, result: StatResult }] }  — skips hidden placements
```

The `DataProvider` is where `@event-engine/stats` plugs in.

## Customization (immutable)

```ts
let d = hidePlacement(d, "old_metric");
d = setFilter(d, "revenue", { region: "us" }); // the saved-filter binding -> flows to the provider
d = reorderPlacements(d, ["revenue", "signups"]);
```

Each returns a new `Dashboard` — safe as reducer-style state updates in any frontend.

## Sharing

```ts
canView({ dashboard, owner, visibility: "account_wide" }, viewer);
// the ladder: private -> in_account (sharedWith) -> account_wide -> external
```

The package owns the access decision and the model; identity/auth stays the host's job.

## Status

Real and TDD-tested. This implements the *documented* design of the Ruby `dash_kit` (a `DataProvider` port + sharing ladder) rather than its current widget-preference implementation — a deliberate, agreed divergence.
