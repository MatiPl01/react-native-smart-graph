/* eslint-disable @typescript-eslint/no-non-null-assertion */
export default class PriorityQueue<T> {
  private readonly heap: Array<{ data: T; priority: number }> = [];

  constructor(private readonly comparator: (a: number, b: number) => number) {}

  get length(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  getItems(): Array<T> {
    const pqCopy = new PriorityQueue(this.comparator);
    pqCopy.heap.push(...this.heap);

    const items: Array<T> = [];
    while (pqCopy.length > 0) {
      items.push(pqCopy.dequeue() as T);
    }

    return items;
  }

  enqueue(data: T, priority: number) {
    this.heap.push({ data, priority });
    this.siftUp(this.heap.length - 1);
  }

  enqueueMany(items: Array<{ item: T; priority: number }>) {
    items.forEach(({ item, priority }) => this.enqueue(item, priority));
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;

    const top = this.heap[0]!.data;
    const bottom = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.siftDown(0);
    }

    return top;
  }

  private siftUp(idx: number) {
    while (idx > 0) {
      const parentIdx = this.parentIndex(idx);

      if (
        this.comparator(
          this.heap[idx]!.priority,
          this.heap[parentIdx]!.priority
        ) >= 0
      ) {
        break;
      }

      this.swap(idx, parentIdx);
      idx = parentIdx;
    }
  }

  private siftDown(idx: number) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const leftIdx = this.leftChildIndex(idx);
      const rightIdx = this.rightChildIndex(idx);
      let smallestIdx = idx;

      if (leftIdx < this.heap.length) {
        if (
          this.comparator(
            this.heap[leftIdx]!.priority,
            this.heap[smallestIdx]!.priority
          ) < 0
        ) {
          smallestIdx = leftIdx;
        }
        if (
          rightIdx < this.heap.length &&
          this.comparator(
            this.heap[rightIdx]!.priority,
            this.heap[smallestIdx]!.priority
          ) < 0
        ) {
          smallestIdx = rightIdx;
        }
      }

      if (smallestIdx === idx) break;

      this.swap(idx, smallestIdx);
      idx = smallestIdx;
    }
  }

  private parentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChildIndex(index: number): number {
    return index * 2 + 1;
  }

  private rightChildIndex(index: number): number {
    return index * 2 + 2;
  }

  private swap(a: number, b: number) {
    [this.heap[a], this.heap[b]] = [this.heap[b]!, this.heap[a]!];
  }
}
