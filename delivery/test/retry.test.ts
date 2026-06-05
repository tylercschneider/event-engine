import { describe, it, expect } from "vitest";
import { retrying } from "../src/retry";
import type { OutboxEvent } from "../src/outbox";

const event: OutboxEvent = { name: "invoice.paid", occurredAt: "t", payload: 1 };

describe("retrying", () => {
  it("delivers through the transport on success", async () => {
    const delivered: OutboxEvent[] = [];
    const transport = retrying(
      (delivery) => {
        delivered.push(delivery);
      },
      { attempts: 3, onDeadLetter: () => undefined },
    );
    await transport(event);
    expect(delivered).toEqual([event]);
  });
});
