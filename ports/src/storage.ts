export interface KeyedStore<Id, Entity> {
  get(id: Id): Promise<Entity | null>;
  put(id: Id, entity: Entity): Promise<void>;
  delete(id: Id): Promise<void>;
}

export class InMemoryKeyedStore<Id, Entity> implements KeyedStore<Id, Entity> {
  private readonly rows = new Map<Id, Entity>();

  async get(id: Id): Promise<Entity | null> {
    return this.rows.get(id) ?? null;
  }

  async put(id: Id, entity: Entity): Promise<void> {
    this.rows.set(id, entity);
  }

  async delete(id: Id): Promise<void> {
    this.rows.delete(id);
  }
}
