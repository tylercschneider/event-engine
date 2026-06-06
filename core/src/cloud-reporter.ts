export type ReportStatus = "emitted" | "published" | "dead_lettered";

export interface ReportEntry {
  name: string;
  occurredAt: string;
  status: ReportStatus;
  version?: number;
  idempotencyKey?: string;
  aggregateType?: string;
  aggregateId?: string;
  aggregateVersion?: number;
}

interface ReportableEvent {
  name: string;
  occurredAt: string;
  version?: number;
  idempotencyKey?: string;
  aggregateType?: string;
  aggregateId?: string;
  aggregateVersion?: number;
}

export type ReportClient = (batch: ReportEntry[]) => void | Promise<void>;

export class CloudReporter {
  private buffer: ReportEntry[] = [];

  constructor(
    private readonly client: ReportClient,
    private readonly batchSize = 50,
  ) {}

  track(status: ReportStatus, event: ReportableEvent): void {
    this.buffer.push({
      name: event.name,
      occurredAt: event.occurredAt,
      status,
      version: event.version,
      idempotencyKey: event.idempotencyKey,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      aggregateVersion: event.aggregateVersion,
    });
    if (this.buffer.length >= this.batchSize) void this.flush();
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    await this.client(batch);
  }
}
