import { describe, it, expect } from "vitest";
import { InMemoryKeyedStore, InMemoryAppendOnlyStore } from "../src/storage";

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

  it("returns null after the entity is deleted", async () => {
    const store = new InMemoryKeyedStore<string, { name: string }>();
    await store.put("u1", { name: "Ada" });
    await store.delete("u1");
    expect(await store.get("u1")).toBeNull();
  });
});

describe("InMemoryAppendOnlyStore", () => {
  it("reads back an appended row from the start", async () => {
    const log = new InMemoryAppendOnlyStore<{ id: number }>();
    await log.append({ id: 1 });
    const page = await log.readFrom(null, 10);
    expect(page.rows).toEqual([{ id: 1 }]);
  });

  it("caps a page at the limit", async () => {
    const log = new InMemoryAppendOnlyStore<number>();
    await log.append(1);
    await log.append(2);
    await log.append(3);
    const page = await log.readFrom(null, 2);
    expect(page.rows).toEqual([1, 2]);
  });
});
