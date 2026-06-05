import { describe, it, expect } from "vitest";
import { mergeSchema } from "../src/schema";

describe("mergeSchema", () => {
  it("assigns version 1 to a new event", () => {
    expect(mergeSchema([{ name: "order.placed", shape: "x" }], [])).toEqual([
      { name: "order.placed", version: 1, shape: "x" },
    ]);
  });

  it("bumps a changed event to a new version, keeping the old", () => {
    const committed = [{ name: "order.placed", version: 1, shape: "x" }];
    expect(mergeSchema([{ name: "order.placed", shape: "y" }], committed)).toEqual(
      [
        { name: "order.placed", version: 1, shape: "x" },
        { name: "order.placed", version: 2, shape: "y" },
      ],
    );
  });
});
