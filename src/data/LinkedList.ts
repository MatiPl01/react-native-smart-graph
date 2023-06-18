class Node<T> {
  public next: Node<T> | null = null;

  constructor(public value: T) {}
}

export default class LinkedList<T> {
  private length$ = 0;
  public head: Node<T> | null = null;
  public tail: Node<T> | null = null;

  public append(value: T): void {
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

  public get length(): number {
    return this.length$;
  }

  public popLeft(): T | null {
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

  public prepend(value: T): void {
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
}
