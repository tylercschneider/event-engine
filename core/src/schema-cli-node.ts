import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { SchemaCliEffects } from "./schema-cli";

export function createNodeEffects(): SchemaCliEffects {
  return {
    readFile: (path) => (existsSync(path) ? readFileSync(path, "utf8") : ""),
    writeFile: (path, contents) => writeFileSync(path, contents),
    log: (message) => console.log(message),
  };
}
