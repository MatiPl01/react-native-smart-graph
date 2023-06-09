import { LinkedList } from '@/data';

export default class Queue<T> {
  protected linkedList: LinkedList<T> = new LinkedList();

  get length(): number {
    return this.linkedList.length;
  }

  isEmpty(): boolean {
    return !this.linkedList.head;
  }

  enqueue(value: T): void {
    this.linkedList.append(value);
  }

  enqueueMany(values: Array<T>): void {
    values.forEach(value => this.enqueue(value));
  }

  dequeue(): T | null {
    return this.linkedList.popLeft();
  }

  peek(): T | null {
    if (!this.linkedList.head) {
      return null;
    }

    return this.linkedList.head.value;
  }
}
