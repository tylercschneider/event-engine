import type {
  AppendOnlyStore,
  JobQueue,
  TransactionManager,
} from "@stats/ports";

export interface OutboxEvent {
  name: string;
  occurredAt: string;
  payload: unknown;
}

export type Transport = (event: OutboxEvent) => void | Promise<void>;

export class Outbox {
  constructor(
    private readonly log: AppendOnlyStore<OutboxEvent>,
    private readonly jobs: JobQueue,
    private readonly transactions: TransactionManager,
    private readonly transport: Transport,
  ) {
    this.jobs.process<OutboxEvent>("deliver", async (event) => {
      await this.transport(event);
    });
  }

  async emit(event: OutboxEvent): Promise<void> {
    await this.transactions.run(async () => {
      await this.log.append(event);
      await this.jobs.enqueue<OutboxEvent>({ name: "deliver", payload: event });
    });
  }
}
