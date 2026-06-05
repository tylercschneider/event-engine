# @event-engine/stats

The display contract: a self-describing, source-agnostic **stat**, and the normalized result shape every stat resolves to. Depends on nothing concrete — a source adapter bridges it to data.

## The result shape

A discriminated union — consumers narrow on `shape`:

```ts
scalar(48200, { asOf, exact: true });
series([{ t: "2026-01", v: 15000 }], { asOf, exact: true });
breakdown([{ label: "US", v: 9 }], { asOf, exact: false });
// each: { shape, value, asOf, exact }
```

`asOf` is when the data was current; `exact` is `false` when the number came from a sketch/sample.

## The Stat definition

```ts
const MonthlyRevenue: Stat = {
  key: "monthly_revenue",
  title: "Monthly Revenue",
  definition: "Sum of paid invoice amounts in the month.",
  unit: "currency",
  timeframe: "mtd",
  inputs: {
    accountId: { key: "accountId", required: true, validate: (v): v is string => typeof v === "string" },
  },
};
```

## Resolving inputs

```ts
resolveInputs(MonthlyRevenue, { accountId: "a1" });
// throws MissingInputError (required absent) or InvalidInputError (failed validate)
```

This is the boundary where untyped values (saved filters, URL params) get checked before reaching a source.

## The source port

```ts
interface StatSource {
  resolve(stat, inputs): Promise<StatResult>;
}
```

`InMemoryStatSource` is the reference; `@event-engine/metrics` (or a dashboard's `DataProvider`) implements it for real.

## Status

Real and TDD-tested. This is essentially pure contracts + a small runtime — the cleanest piece.
