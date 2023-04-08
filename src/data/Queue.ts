import LinkedList from './LinkedList';

export default class Queue<V> {
  private linkedList: LinkedList<V> = new LinkedList();

  public isEmpty(): boolean {
    return !this.linkedList.head;
  }

  public enqueue(value: V): void {
    this.linkedList.append(value);
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
}
