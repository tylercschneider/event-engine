export interface ResultMeta {
  asOf: string;
  exact: boolean;
}

export interface ScalarResult extends ResultMeta {
  shape: "scalar";
  value: number;
}

export type StatResult = ScalarResult;

export function scalar(value: number, meta: ResultMeta): ScalarResult {
  return { shape: "scalar", value, ...meta };
}
