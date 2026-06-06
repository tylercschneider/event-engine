import { describe, it, expect } from "vitest";
import { CloudReporter, type ReportEntry } from "../src/cloud-reporter";

describe("CloudReporter", () => {
  it("flushes tracked entries to the client", async () => {
    const sent: ReportEntry[][] = [];
    const reporter = new CloudReporter((batch) => {
      sent.push(batch);
    });
    reporter.track("emitted", { name: "invoice.paid", occurredAt: "t" });
    await reporter.flush();
    expect(sent).toEqual([
      [{ name: "invoice.paid", occurredAt: "t", status: "emitted" }],
    ]);
  });

  it("reports the event version as metadata", async () => {
    const sent: ReportEntry[][] = [];
    const reporter = new CloudReporter((batch) => {
      sent.push(batch);
    });
    reporter.track("emitted", { name: "invoice.paid", occurredAt: "t", version: 2 });
    await reporter.flush();
    expect(sent[0]?.[0]?.version).toBe(2);
  });

  it("reports the idempotency key as metadata", async () => {
    const sent: ReportEntry[][] = [];
    const reporter = new CloudReporter((batch) => {
      sent.push(batch);
    });
    reporter.track("emitted", {
      name: "invoice.paid",
      occurredAt: "t",
      idempotencyKey: "idem-1",
    });
    await reporter.flush();
    expect(sent[0]?.[0]?.idempotencyKey).toBe("idem-1");
  });

  it("reports the aggregate identity as metadata", async () => {
    const sent: ReportEntry[][] = [];
    const reporter = new CloudReporter((batch) => {
      sent.push(batch);
    });
    reporter.track("emitted", {
      name: "invoice.paid",
      occurredAt: "t",
      aggregateType: "Invoice",
      aggregateId: "inv-9",
      aggregateVersion: 3,
    });
    await reporter.flush();
    expect(sent[0]?.[0]).toMatchObject({
      aggregateType: "Invoice",
      aggregateId: "inv-9",
      aggregateVersion: 3,
    });
  });

  it("never includes the event payload", async () => {
    const sent: ReportEntry[][] = [];
    const reporter = new CloudReporter((batch) => {
      sent.push(batch);
    });
    const event = {
      name: "invoice.paid",
      occurredAt: "t",
      payload: { secret: "pii" },
    };
    reporter.track("emitted", event);
    await reporter.flush();
    expect(sent[0]?.[0]).not.toHaveProperty("payload");
  });

  it("auto-flushes at the batch size", () => {
    const sent: ReportEntry[][] = [];
    const reporter = new CloudReporter((batch) => {
      sent.push(batch);
    }, 2);
    reporter.track("emitted", { name: "a", occurredAt: "t" });
    reporter.track("emitted", { name: "b", occurredAt: "t" });
    expect(sent).toHaveLength(1);
  });

  it("does not call the client when there is nothing to flush", async () => {
    let calls = 0;
    const reporter = new CloudReporter(() => {
      calls++;
    });
    await reporter.flush();
    expect(calls).toBe(0);
  });
});
