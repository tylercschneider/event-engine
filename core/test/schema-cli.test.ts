import { describe, it, expect } from "vitest";
import { createSchemaCli } from "../src/schema-cli";
import { mergeSchema, dumpSchema } from "../src/schema";

function fakeEffects(initial: Record<string, string> = {}) {
  const files: Record<string, string> = { ...initial };
  const logs: string[] = [];
  return {
    files,
    logs,
    readFile: (path: string) => files[path] ?? "",
    writeFile: (path: string, contents: string) => {
      files[path] = contents;
    },
    log: (message: string) => {
      logs.push(message);
    },
  };
}

describe("createSchemaCli", () => {
  it("dumps a fresh schema to the default path", () => {
    const effects = fakeEffects();
    createSchemaCli([{ name: "order.placed", shape: "x" }], effects).run([
      "node",
      "schema",
      "dump",
    ]);
    expect(effects.files["./event-schema.json"]).toBe(
      dumpSchema(mergeSchema([{ name: "order.placed", shape: "x" }], [])),
    );
  });
});
