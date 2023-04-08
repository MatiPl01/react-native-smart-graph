import LinkedList from './LinkedList';

export default class Queue<V> {
  protected linkedList: LinkedList<V> = new LinkedList();

  public isEmpty(): boolean {
    return !this.linkedList.head;
  }

  public enqueue(value: V): void {
    this.linkedList.append(value);
  }

  public enqueueMany(values: V[]): void {
    values.forEach(value => this.enqueue(value));
  }

  public dequeue(): V | null {
    return this.linkedList.popLeft();
  }

  public peek(): V | null {
    if (!this.linkedList.head) {
      return null;
    }

    return this.linkedList.head.value;
  }

  public get length(): number {
    return this.linkedList.length;
  }
}
