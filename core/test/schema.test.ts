import { describe, it, expect } from "vitest";
import {
  mergeSchema,
  dumpSchema,
  loadSchema,
  checkSchemaDrift,
  SchemaFileDriftError,
} from "../src/schema";
import type { SchemaEntry } from "../src/schema";

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

describe("dumpSchema", () => {
  it("serializes entries to a JSON string", () => {
    const dumped = dumpSchema([{ name: "order.placed", version: 1, shape: "x" }]);
    expect(JSON.parse(dumped)).toEqual([
      { name: "order.placed", version: 1, shape: "x" },
    ]);
  });

  it("orders entries by name then version", () => {
    const dumped = dumpSchema([
      { name: "order.shipped", version: 1, shape: "s" },
      { name: "order.placed", version: 2, shape: "p2" },
      { name: "order.placed", version: 1, shape: "p1" },
    ]);
    expect(
      (JSON.parse(dumped) as SchemaEntry[]).map(
        (entry) => `${entry.name}:${entry.version}`,
      ),
    ).toEqual(["order.placed:1", "order.placed:2", "order.shipped:1"]);
  });
});

describe("loadSchema", () => {
  it("parses serialized entries back from a JSON string", () => {
    const dumped = dumpSchema([{ name: "order.placed", version: 1, shape: "x" }]);
    expect(loadSchema(dumped)).toEqual([
      { name: "order.placed", version: 1, shape: "x" },
    ]);
  });

  it("treats blank contents as an empty schema", () => {
    expect(loadSchema("   \n")).toEqual([]);
  });
});

describe("checkSchemaDrift", () => {
  it("passes when the committed contents already cover the declared events", () => {
    const declared = [{ name: "order.placed", shape: "x" }];
    const committed = dumpSchema(mergeSchema(declared, []));
    expect(() => checkSchemaDrift(committed, declared)).not.toThrow();
  });

  it("raises drift when a declared event is missing from the committed contents", () => {
    const committed = dumpSchema([{ name: "order.placed", version: 1, shape: "x" }]);
    let caught: unknown;
    try {
      checkSchemaDrift(committed, [{ name: "order.shipped", shape: "y" }]);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SchemaFileDriftError);
  });
});
