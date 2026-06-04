import { describe, it, expect } from "vitest";
import { InlineJobQueue } from "../src/jobs";

describe("InlineJobQueue", () => {
  it("runs a registered handler with the job payload", async () => {
    const queue = new InlineJobQueue();
    const seen: number[] = [];
    queue.process<number>("count", async (payload) => {
      seen.push(payload);
    });
    await queue.enqueue({ name: "count", payload: 7 });
    expect(seen).toEqual([7]);
  });
});
