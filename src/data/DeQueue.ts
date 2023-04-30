import Queue from './Queue';

/**
 * DeQueue is an implementation of double-ended queue.
 */
export default class DeQueue<T> extends Queue<T> {
  public enqueueFront(value: T): void {
    this.linkedList.prepend(value);
  }

  public enqueueFrontMany(values: Array<T>): void {
    values.forEach(value => this.enqueueFront(value));
  }

  public peekBack(): T | null {
    if (!this.linkedList.tail) {
      return null;
    }

    return this.linkedList.tail.value;
  }
}
