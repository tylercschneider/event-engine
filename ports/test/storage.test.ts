import { describe, it, expect } from "vitest";
import { InMemoryKeyedStore } from "../src/storage";

describe("InMemoryKeyedStore", () => {
  it("returns null for a key that was never put", async () => {
    const store = new InMemoryKeyedStore<string, { name: string }>();
    expect(await store.get("missing")).toBeNull();
  });
});
