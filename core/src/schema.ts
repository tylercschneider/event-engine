export interface SchemaEntry {
  name: string;
  version: number;
  shape: string;
}

export interface DeclaredEvent {
  name: string;
  shape: string;
}

export function mergeSchema(
  declared: DeclaredEvent[],
  committed: SchemaEntry[],
): SchemaEntry[] {
  const result = [...committed];
  for (const event of declared) {
    const versions = committed
      .filter((entry) => entry.name === event.name)
      .sort((a, b) => a.version - b.version);
    const latest = versions[versions.length - 1];
    if (!latest) {
      result.push({ name: event.name, version: 1, shape: event.shape });
    } else if (latest.shape !== event.shape) {
      result.push({
        name: event.name,
        version: latest.version + 1,
        shape: event.shape,
      });
    }
  }
  return result;
}
