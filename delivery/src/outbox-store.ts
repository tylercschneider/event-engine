import { randomUUID } from "node:crypto";
import type { OutboxEvent } from "./outbox";

export type OutboxStatus = "pending" | "published" | "dead_lettered";

export interface OutboxRecord {
  id: string;
  event: OutboxEvent;
  status: OutboxStatus;
  attempts: number;
  publishedAt?: string;
  deadLetteredAt?: string;
  lastError?: string;
}

export class OutboxStore {
  private readonly records = new Map<string, OutboxRecord>();

  record(event: OutboxEvent): OutboxRecord {
    const record: OutboxRecord = {
      id: randomUUID(),
      event,
      status: "pending",
      attempts: 0,
    };
    this.records.set(record.id, record);
    return record;
  }
}
