type Node<T> = {
  next: Node<T> | null;
  value: T;
};

const createNode = <T>(value: T): Node<T> => {
  'worklet';
  return {
    next: null,
    value
  };
};

export const createLinkedList = <T>() => {
  'worklet';
  let length = 0;
  let head: Node<T> | null = null;
  let tail: Node<T> | null = null;

  return {
    append(value: T) {
      'worklet';
      const node = createNode(value);

      if (!tail) {
        head = node;
        tail = node;
        return;
      }

      tail.next = node;
      tail = node;
      length++;
    },

    head() {
      'worklet';
      return head;
    },

    length() {
      'worklet';
      return length;
    },

    popLeft() {
      'worklet';
      if (!head) {
        return null;
      }

      const value = head.value;

      head = head.next;
      if (!head) {
        tail = null;
      }

      length--;
      return value;
    },

    prepend(value: T): void {
      'worklet';
      const node = createNode(value);

      if (!head) {
        head = node;
        tail = node;
        return;
      }

      node.next = head;
      head = node;
      length++;
    },

    tail() {
      'worklet';
      return tail;
    }
  };
};
