export type ReportStatus = "emitted" | "published" | "dead_lettered";

export interface ReportEntry {
  name: string;
  occurredAt: string;
  status: ReportStatus;
}

export type ReportClient = (batch: ReportEntry[]) => void | Promise<void>;

export class CloudReporter {
  private buffer: ReportEntry[] = [];

  constructor(
    private readonly client: ReportClient,
    private readonly batchSize = 50,
  ) {}

  track(status: ReportStatus, event: { name: string; occurredAt: string }): void {
    this.buffer.push({ name: event.name, occurredAt: event.occurredAt, status });
    if (this.buffer.length >= this.batchSize) void this.flush();
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    await this.client(batch);
  }
}
