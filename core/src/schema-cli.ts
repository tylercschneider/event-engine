import {
  mergeSchema,
  dumpSchema,
  loadSchema,
  checkSchemaDrift,
  SchemaFileDriftError,
} from "./schema";
import type { DeclaredEvent } from "./schema";

export interface SchemaCliDefinition {
  name: string;
  shape: string;
}

export interface SchemaCliEffects {
  readFile(path: string): string;
  writeFile(path: string, contents: string): void;
  log(message: string): void;
}

const DEFAULT_PATH = "./event-schema.json";

export function createSchemaCli(
  definitions: SchemaCliDefinition[],
  effects: SchemaCliEffects,
) {
  const declared: DeclaredEvent[] = definitions.map((definition) => ({
    name: definition.name,
    shape: definition.shape,
  }));

  return {
    run(argv: string[]): number {
      const [, , command, pathArg] = argv;
      const path = pathArg ?? DEFAULT_PATH;
      if (command === "dump") {
        const committed = loadSchema(effects.readFile(path));
        effects.writeFile(path, dumpSchema(mergeSchema(declared, committed)));
        return 0;
      }
      if (command === "check") {
        try {
          checkSchemaDrift(effects.readFile(path), declared);
          return 0;
        } catch (error) {
          if (error instanceof SchemaFileDriftError) {
            return 1;
          }
          throw error;
        }
      }
      return 0;
    },
  };
}
