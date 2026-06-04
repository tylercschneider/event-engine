export interface Transaction {
  readonly raw: unknown;
}

export interface TransactionManager {
  run<T>(work: (tx: Transaction) => Promise<T>): Promise<T>;
  current(): Transaction | null;
}

export class InMemoryTransactionManager implements TransactionManager {
  async run<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    return work({ raw: {} });
  }

  current(): Transaction | null {
    return null;
  }
}
