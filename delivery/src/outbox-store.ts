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

  counts(): {
    total: number;
    pending: number;
    published: number;
    deadLettered: number;
  } {
    let pending = 0;
    let published = 0;
    let deadLettered = 0;
    for (const record of this.records.values()) {
      if (record.status === "pending") pending++;
      else if (record.status === "published") published++;
      else deadLettered++;
    }
    return { total: this.records.size, pending, published, deadLettered };
  }
}
