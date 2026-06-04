export interface NamedEventDefinition {
  name: string;
}

export class EventRegistry {
  private readonly definitions: NamedEventDefinition[] = [];

  register(definition: NamedEventDefinition): void {
    this.definitions.push(definition);
  }

  catalog(): NamedEventDefinition[] {
    return [...this.definitions];
  }
}
