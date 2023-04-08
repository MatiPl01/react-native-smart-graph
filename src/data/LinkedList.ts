class Node<V> {
  public next: Node<V> | null = null;

  constructor(public value: V) {}
}

export default class LinkedList<V> {
  public head: Node<V> | null = null;
  public tail: Node<V> | null = null;
  public length = 0;

  public append(value: V): void {
    this.length++;
    const node = new Node(value);

    if (!this.tail) {
      this.head = node;
      this.tail = node;
      return;
    }

    this.tail.next = node;
    this.tail = node;
  }

  public prepend(value: V): void {
    this.length++;
    const node = new Node(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
      return;
    }

    node.next = this.head;
    this.head = node;
  }

  public popLeft(): V | null {
    this.length--;
    if (!this.head) {
      return null;
    }

    const value = this.head.value;

    this.head = this.head.next;
    if (!this.head) {
      this.tail = null;
    }

    return value;
  }
}
