import { describe, it, expect } from "vitest";
import { retrying, type DeadLetter } from "../src/retry";
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

  it("retries a failing transport until it succeeds", async () => {
    let calls = 0;
    const transport = retrying(
      () => {
        calls++;
        if (calls < 2) throw new Error("flaky");
      },
      { attempts: 3, onDeadLetter: () => undefined },
    );
    await transport(event);
    expect(calls).toBe(2);
  });

  it("dead-letters after exhausting all attempts", async () => {
    const deadLettered: DeadLetter[] = [];
    const transport = retrying(
      () => {
        throw new Error("down");
      },
      {
        attempts: 3,
        onDeadLetter: (entry) => {
          deadLettered.push(entry);
        },
      },
    );
    await transport(event);
    expect(deadLettered.map((entry) => entry.attempts)).toEqual([3]);
  });
});
