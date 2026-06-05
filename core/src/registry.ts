export interface NamedEventDefinition {
  name: string;
  fingerprint: string;
}

export class SchemaDriftError extends Error {
  constructor(name: string) {
    super(`event "${name}" changed shape without a version bump`);
    this.name = "SchemaDriftError";
  }
}

export class EventRegistry {
  private readonly byName = new Map<string, NamedEventDefinition>();

  register(definition: NamedEventDefinition): void {
    const existing = this.byName.get(definition.name);
    if (existing && existing.fingerprint !== definition.fingerprint) {
      throw new SchemaDriftError(definition.name);
    }
    this.byName.set(definition.name, definition);
  }

  catalog(): NamedEventDefinition[] {
    return [...this.byName.values()];
  }
}
