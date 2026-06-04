export interface Job<Payload> {
  name: string;
  payload: Payload;
  dedupeKey?: string;
}

type Handler = (payload: unknown) => Promise<void>;

export interface JobQueue {
  enqueue<P>(job: Job<P>): Promise<void>;
  process<P>(name: string, handler: (payload: P) => Promise<void>): void;
}

export class InlineJobQueue implements JobQueue {
  private readonly handlers = new Map<string, Handler>();

  process<P>(name: string, handler: (payload: P) => Promise<void>): void {
    this.handlers.set(name, handler as Handler);
  }

  async enqueue<P>(job: Job<P>): Promise<void> {
    const handler = this.handlers.get(job.name);
    if (handler) await handler(job.payload);
  }
}
