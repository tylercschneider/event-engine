export interface KeyedStore<Id, Entity> {
  get(id: Id): Promise<Entity | null>;
}

export class InMemoryKeyedStore<Id, Entity> implements KeyedStore<Id, Entity> {
  async get(_id: Id): Promise<Entity | null> {
    return null;
  }
}
