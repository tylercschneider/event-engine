import { describe, it, expect } from "vitest";
import { InMemoryKeyedStore } from "../src/index";

describe("@stats/ports public api", () => {
  it("exposes a working keyed store through the package entry", async () => {
    const store = new InMemoryKeyedStore<string, number>();
    await store.put("answer", 42);
    expect(await store.get("answer")).toBe(42);
  });
});
