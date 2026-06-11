# @eventengine/metrics

Turn recorded events into numbers — the aggregation engine. Operates over `StoredEvent[]` from `@eventengine/store`.

## Measures

A measure reduces a set of events to a number:

```ts
additive("revenue", (e) => e.payload as number);   // sum
latest("balance", (e) => e.payload as number);     // value of the most recent event (semi-additive)
distinct("active_users", (e) => e.payload as string); // count of unique keys (holistic)
```

Each returns a `Measure` with a `kind` (`additive` / `semi_additive` / `holistic` / `cohort` / `derived`) and `compute(events): number`.

## Registry

```ts
const registry = new MeasureRegistry();
registry.define(additive("revenue", amountOf)); // throws DuplicateMeasureError on a repeat key
registry.get("revenue");
```

## Rollups

Compute a measure per bucket — the general grouping (time → series, dimension → breakdown, cohort key → cohort):

```ts
rollup(events, (e) => e.occurredAt, additive("revenue", amountOf));
// -> [{ bucket: "2026-01", value: 15 }, { bucket: "2026-02", value: 8 }]
```

## Mergeable sketches

```ts
usSketch.merge(euSketch).estimate(); // distinct across both segments, no raw rescan
```

`ExactDistinctSketch` is the exact reference; a probabilistic HyperLogLog backing can slot in behind the same `add` / `estimate` / `merge` shape.

## Derived metrics (sandboxed expression DSL)

```ts
const aov = derived("aov", "revenue / orders", { revenue, orders });
aov.compute(events); // computes each input measure, then evaluates the expression
```

`evaluate(expression, bindings)` is a hand-written tokenizer + recursive-descent parser — **no `eval`, no `Function`, no `vm`**. It knows numbers, bound variables, `+ - * /`, and parentheses; unbound names throw `UnknownVariableError`, malformed input throws `ExpressionError`.

## Status

Real and TDD-tested. Idempotent recompute and a probabilistic sketch backing are pending.
