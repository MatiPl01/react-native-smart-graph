import LinkedList from './LinkedList';

export default class Queue<T> {
  protected linkedList: LinkedList<T> = new LinkedList();

  public dequeue(): T | null {
    return this.linkedList.popLeft();
  }

  public enqueue(value: T): void {
    this.linkedList.append(value);
  }

  public enqueueMany(values: Array<T>): void {
    values.forEach(value => this.enqueue(value));
  }

  public isEmpty(): boolean {
    return !this.linkedList.head;
  }

  public get length(): number {
    return this.linkedList.length;
  }

  public peek(): T | null {
    if (!this.linkedList.head) {
      return null;
    }

    return this.linkedList.head.value;
  }
}
