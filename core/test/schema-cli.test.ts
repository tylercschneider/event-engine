import { describe, it, expect } from "vitest";
import { createSchemaCli } from "../src/schema-cli";
import { mergeSchema, dumpSchema, loadSchema } from "../src/schema";

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

  it("dumps by merging into the existing committed schema", () => {
    const existing = dumpSchema([
      { name: "order.placed", version: 1, shape: "old" },
    ]);
    const effects = fakeEffects({ "./event-schema.json": existing });
    createSchemaCli([{ name: "order.placed", shape: "new" }], effects).run([
      "node",
      "schema",
      "dump",
    ]);
    expect(
      loadSchema(effects.readFile("./event-schema.json")).map(
        (entry) => entry.version,
      ),
    ).toEqual([1, 2]);
  });

  it("returns a nonzero exit code when check finds drift", () => {
    const effects = fakeEffects();
    const code = createSchemaCli(
      [{ name: "order.placed", shape: "x" }],
      effects,
    ).run(["node", "schema", "check"]);
    expect(code).toBe(1);
  });

  it("logs remediation guidance when check finds drift", () => {
    const effects = fakeEffects();
    createSchemaCli([{ name: "order.placed", shape: "x" }], effects).run([
      "node",
      "schema",
      "check",
    ]);
    expect(effects.logs.some((line) => line.includes("dump"))).toBe(true);
  });
});
