import { describe, it, expect } from "vitest";
import { InMemoryTransactionManager } from "../src/transaction";

describe("InMemoryTransactionManager", () => {
  it("returns the result of the work it runs", async () => {
    const manager = new InMemoryTransactionManager();
    const result = await manager.run(async () => 42);
    expect(result).toBe(42);
  });
});
