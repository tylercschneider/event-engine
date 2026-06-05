import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineEvent, Level } from "@stats/event-engine";
import {
  Collector,
  collectorHandler,
  type Signal,
  type Sink,
} from "../src/index";

describe("@stats/telemetry public api", () => {
  it("collects a defined telemetry event and flushes it to the sink through the package entry", async () => {
    const PageView = defineEvent({
      name: "page.view",
      version: 1,
      level: Level.Telemetry,
      schema: z.object({ path: z.string() }),
    });
    const batches: Signal[][] = [];
    const sink: Sink = {
      write(batch) {
        batches.push(batch);
      },
    };
    const collector = new Collector(sink, 100);
    await collector.collect(PageView.build({ path: "/home" }, "2026-01-01T00:00:00Z"));
    await collector.flush();
    expect(batches[0]?.[0]?.name).toBe("page.view");
  });

  it("handles a posted body of signals and flushes them to the sink through the package entry", async () => {
    const batches: Signal[][] = [];
    const sink: Sink = {
      write(batch) {
        batches.push(batch);
      },
    };
    const handle = collectorHandler(new Collector(sink, 2));
    await handle([
      { name: "page.view", occurredAt: "t", payload: { path: "/a" } },
      { name: "page.view", occurredAt: "t", payload: { path: "/b" } },
    ]);
    expect(batches[0]?.length).toBe(2);
  });
});
