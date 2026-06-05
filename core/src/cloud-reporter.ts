export type ReportStatus = "emitted" | "published" | "dead_lettered";

export interface ReportEntry {
  name: string;
  occurredAt: string;
  status: ReportStatus;
}

export type ReportClient = (batch: ReportEntry[]) => void | Promise<void>;

export class CloudReporter {
  private buffer: ReportEntry[] = [];

  constructor(private readonly client: ReportClient) {}

  track(status: ReportStatus, event: { name: string; occurredAt: string }): void {
    this.buffer.push({ name: event.name, occurredAt: event.occurredAt, status });
  }

  async flush(): Promise<void> {
    const batch = this.buffer;
    this.buffer = [];
    await this.client(batch);
  }
}
