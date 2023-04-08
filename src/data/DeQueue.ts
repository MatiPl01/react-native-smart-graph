import Queue from './Queue';

/**
 * DeQueue is an implementation of double-ended queue.\
 */
export default class DeQueue<V> extends Queue<V> {
  public enqueueFront(value: V): void {
    this.linkedList.prepend(value);
  }

  public enqueueFrontMany(values: V[]): void {
    values.forEach(value => this.enqueueFront(value));
  }

  public peekBack(): V | null {
    if (!this.linkedList.tail) {
      return null;
    }

    return this.linkedList.tail.value;
  }
}
