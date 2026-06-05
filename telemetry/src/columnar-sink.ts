import type { Signal, Sink } from "./collector";

export interface Columns {
  name: string[];
  occurredAt: string[];
  payload: unknown[];
}

export class ColumnarSink implements Sink {
  readonly columns: Columns = { name: [], occurredAt: [], payload: [] };

  write(batch: Signal[]): void {
    for (const signal of batch) {
      this.columns.name.push(signal.name);
      this.columns.occurredAt.push(signal.occurredAt);
      this.columns.payload.push(signal.payload);
    }
  }
}
