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

export interface Page<Row> {
  rows: Row[];
  next: string | null;
}

export interface AppendOnlyStore<Row> {
  append(row: Row): Promise<void>;
  readFrom(cursor: string | null, limit: number): Promise<Page<Row>>;
}

export class InMemoryAppendOnlyStore<Row> implements AppendOnlyStore<Row> {
  private readonly log: Row[] = [];

  async append(row: Row): Promise<void> {
    this.log.push(row);
  }

  async readFrom(cursor: string | null, limit: number): Promise<Page<Row>> {
    const start = cursor === null ? 0 : Number(cursor);
    const rows = this.log.slice(start, start + limit);
    const nextIndex = start + rows.length;
    const next = nextIndex < this.log.length ? String(nextIndex) : null;
    return { rows, next };
  }
}
