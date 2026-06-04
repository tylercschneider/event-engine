export class ExactDistinctSketch {
  private readonly keys = new Set<string>();

  add(key: string): void {
    this.keys.add(key);
  }

  estimate(): number {
    return this.keys.size;
  }

  merge(other: ExactDistinctSketch): ExactDistinctSketch {
    const merged = new ExactDistinctSketch();
    for (const key of this.keys) merged.add(key);
    for (const key of other.keys) merged.add(key);
    return merged;
  }
}
