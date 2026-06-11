import { describe, it, expect } from "vitest";
import {
  InMemoryKeyedStore,
  InMemoryAppendOnlyStore,
  InMemoryTransactionManager,
  InlineJobQueue,
} from "../src/index";

describe("@eventengine/ports public api", () => {
  it("exposes a working keyed store through the package entry", async () => {
    const store = new InMemoryKeyedStore<string, number>();
    await store.put("answer", 42);
    expect(await store.get("answer")).toBe(42);
  });

  it("exposes a working append-only store through the package entry", async () => {
    const log = new InMemoryAppendOnlyStore<number>();
    await log.append(7);
    const page = await log.readFrom(null, 10);
    expect(page.rows).toEqual([7]);
  });

  it("exposes a transaction manager that tracks the active run", async () => {
    const manager = new InMemoryTransactionManager();
    const inside = await manager.run(async () => manager.current() !== null);
    expect(inside).toBe(true);
  });

  it("exposes a job queue that dispatches to handlers through the package entry", async () => {
    const queue = new InlineJobQueue();
    const seen: string[] = [];
    queue.process<string>("greet", async (payload) => {
      seen.push(payload);
    });
    await queue.enqueue({ name: "greet", payload: "hi" });
    expect(seen).toEqual(["hi"]);
  });
});
