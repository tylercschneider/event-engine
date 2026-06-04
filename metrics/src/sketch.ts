export class ExactDistinctSketch {
  private readonly keys = new Set<string>();

  add(key: string): void {
    this.keys.add(key);
  }

  estimate(): number {
    return this.keys.size;
  }

  merge(other: ExactDistinctSketch): ExactDistinctSketch {
    for (const key of other.keys) this.keys.add(key);
    return this;
  }
}
