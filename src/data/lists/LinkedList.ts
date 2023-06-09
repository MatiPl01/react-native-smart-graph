class Node<T> {
  next: Node<T> | null = null;

  constructor(public value: T) {}
}

export default class LinkedList<T> {
  head: Node<T> | null = null;
  tail: Node<T> | null = null;
  private length$ = 0;

  get length(): number {
    return this.length$;
  }

  append(value: T): void {
    const node = new Node(value);

    if (!this.tail) {
      this.head = node;
      this.tail = node;
      return;
    }

    this.tail.next = node;
    this.tail = node;
    this.length$++;
  }

  prepend(value: T): void {
    const node = new Node(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
      return;
    }

    node.next = this.head;
    this.head = node;
    this.length$++;
  }

  popLeft(): T | null {
    if (!this.head) {
      return null;
    }

    const value = this.head.value;

    this.head = this.head.next;
    if (!this.head) {
      this.tail = null;
    }

    this.length$--;
    return value;
  }
}
