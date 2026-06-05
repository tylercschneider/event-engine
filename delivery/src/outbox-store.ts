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

  list(): OutboxRecord[] {
    return [...this.records.values()];
  }

  pending(): OutboxRecord[] {
    return this.list().filter((record) => record.status === "pending");
  }

  deadLetters(): OutboxRecord[] {
    return this.list().filter((record) => record.status === "dead_lettered");
  }

  retry(id: string): void {
    const record = this.records.get(id);
    if (!record) return;
    record.status = "pending";
    record.attempts = 0;
    record.deadLetteredAt = undefined;
    record.lastError = undefined;
  }

  markPublished(id: string): void {
    const record = this.records.get(id);
    if (!record) return;
    record.status = "published";
    record.publishedAt = new Date().toISOString();
  }

  markDeadLettered(id: string, error: string): void {
    const record = this.records.get(id);
    if (!record) return;
    record.status = "dead_lettered";
    record.deadLetteredAt = new Date().toISOString();
    record.lastError = error;
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
