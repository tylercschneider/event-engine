import type { Signal, Sink } from "./collector";

export interface Columns {
  name: string[];
  occurredAt: string[];
  payload: unknown[];
}

export class ColumnarSink implements Sink {
  columns: Columns = { name: [], occurredAt: [], payload: [] };

  write(batch: Signal[]): void {
    this.columns = {
      name: batch.map((signal) => signal.name),
      occurredAt: batch.map((signal) => signal.occurredAt),
      payload: batch.map((signal) => signal.payload),
    };
  }
}
