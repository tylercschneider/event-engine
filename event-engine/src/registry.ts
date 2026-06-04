export interface NamedEventDefinition {
  name: string;
}

export class EventRegistry {
  private readonly byName = new Map<string, NamedEventDefinition>();

  register(definition: NamedEventDefinition): void {
    this.byName.set(definition.name, definition);
  }

  catalog(): NamedEventDefinition[] {
    return [...this.byName.values()];
  }
}
