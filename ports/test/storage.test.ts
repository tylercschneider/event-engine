import { describe, it, expect } from "vitest";
import { InMemoryKeyedStore } from "../src/storage";

describe("InMemoryKeyedStore", () => {
  it("returns null for a key that was never put", async () => {
    const store = new InMemoryKeyedStore<string, { name: string }>();
    expect(await store.get("missing")).toBeNull();
  });

  it("returns the entity after it is put", async () => {
    const store = new InMemoryKeyedStore<string, { name: string }>();
    await store.put("u1", { name: "Ada" });
    expect(await store.get("u1")).toEqual({ name: "Ada" });
  });
});
