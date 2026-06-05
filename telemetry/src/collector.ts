export interface Signal {
  name: string;
  occurredAt: string;
  payload: unknown;
}

export interface Sink {
  write(batch: Signal[]): void | Promise<void>;
}

export class Collector {
  private buffer: Signal[] = [];

  constructor(
    private readonly sink: Sink,
    private readonly batchSize: number,
  ) {}

  async collect(signal: Signal): Promise<void> {
    this.buffer.push(signal);
    if (this.buffer.length >= this.batchSize) await this.flush();
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    await this.sink.write(batch);
  }
}
