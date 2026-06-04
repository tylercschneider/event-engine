import { AsyncLocalStorage } from "node:async_hooks";

export interface Transaction {
  readonly raw: unknown;
}

export interface TransactionManager {
  run<T>(work: (tx: Transaction) => Promise<T>): Promise<T>;
  current(): Transaction | null;
}

export class InMemoryTransactionManager implements TransactionManager {
  private readonly context = new AsyncLocalStorage<Transaction>();

  async run<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    const tx: Transaction = { raw: {} };
    return this.context.run(tx, () => work(tx));
  }

  current(): Transaction | null {
    return this.context.getStore() ?? null;
  }
}
