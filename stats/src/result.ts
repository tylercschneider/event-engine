export interface ResultMeta {
  asOf: string;
  exact: boolean;
}

export interface ScalarResult extends ResultMeta {
  shape: "scalar";
  value: number;
}

export interface SeriesPoint {
  t: string;
  v: number;
}

export interface SeriesResult extends ResultMeta {
  shape: "series";
  value: SeriesPoint[];
}

export interface BreakdownEntry {
  label: string;
  v: number;
}

export interface BreakdownResult extends ResultMeta {
  shape: "breakdown";
  value: BreakdownEntry[];
}

export type StatResult = ScalarResult | SeriesResult | BreakdownResult;

export function scalar(value: number, meta: ResultMeta): ScalarResult {
  return { shape: "scalar", value, ...meta };
}

export function series(value: SeriesPoint[], meta: ResultMeta): SeriesResult {
  return { shape: "series", value, ...meta };
}

export function breakdown(
  value: BreakdownEntry[],
  meta: ResultMeta,
): BreakdownResult {
  return { shape: "breakdown", value, ...meta };
}
