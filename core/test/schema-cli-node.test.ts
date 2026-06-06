import { describe, it, expect } from "vitest";
import { createNodeEffects } from "../src/schema-cli-node";

describe("createNodeEffects", () => {
  it("reads a missing file as empty contents", () => {
    expect(
      createNodeEffects().readFile("/no/such/path/event-schema-missing.json"),
    ).toBe("");
  });
});
