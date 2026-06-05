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
});
