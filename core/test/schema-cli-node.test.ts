import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createNodeEffects } from "../src/schema-cli-node";

describe("createNodeEffects", () => {
  it("reads a missing file as empty contents", () => {
    expect(
      createNodeEffects().readFile("/no/such/path/event-schema-missing.json"),
    ).toBe("");
  });

  it("round-trips contents written to disk", () => {
    const path = join(mkdtempSync(join(tmpdir(), "event-schema-")), "schema.json");
    const effects = createNodeEffects();
    effects.writeFile(path, "round-trip");
    expect(effects.readFile(path)).toBe("round-trip");
  });
});
