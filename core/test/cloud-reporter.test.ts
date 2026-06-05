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
