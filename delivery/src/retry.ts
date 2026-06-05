import type { OutboxEvent, Transport } from "./outbox";

export interface DeadLetter {
  event: OutboxEvent;
  error: unknown;
  attempts: number;
}

export type DeadLetterSink = (entry: DeadLetter) => void | Promise<void>;

export interface RetryOptions {
  attempts: number;
  onDeadLetter: DeadLetterSink;
}

export function retrying(transport: Transport, options: RetryOptions): Transport {
  return async (event: OutboxEvent) => {
    for (let attempt = 1; attempt <= options.attempts; attempt++) {
      await transport(event);
      return;
    }
  };
}
