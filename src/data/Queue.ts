import LinkedList from './LinkedList';

export default class Queue<T> {
  protected linkedList: LinkedList<T> = new LinkedList();

  public isEmpty(): boolean {
    return !this.linkedList.head;
  }

  public enqueue(value: T): void {
    this.linkedList.append(value);
  }

  public enqueueMany(values: T[]): void {
    values.forEach(value => this.enqueue(value));
  }

  public dequeue(): T | null {
    return this.linkedList.popLeft();
  }

  public peek(): T | null {
    if (!this.linkedList.head) {
      return null;
    }

    return this.linkedList.head.value;
  }

  public get length(): number {
    return this.linkedList.length;
  }
}
