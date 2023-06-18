import LinkedList from './LinkedList';

export default class Queue<T> {
  protected linkedList: LinkedList<T> = new LinkedList();

  dequeue(): T | null {
    return this.linkedList.popLeft();
  }

  enqueue(value: T): void {
    this.linkedList.append(value);
  }

  enqueueMany(values: Array<T>): void {
    values.forEach(value => this.enqueue(value));
  }

  isEmpty(): boolean {
    return !this.linkedList.head;
  }

  get length(): number {
    return this.linkedList.length;
  }

  peek(): T | null {
    if (!this.linkedList.head) {
      return null;
    }

    return this.linkedList.head.value;
  }
}
