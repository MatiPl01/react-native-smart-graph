import { createLinkedList } from './LinkedList';

export const createQueue = <T>() => {
  'worklet';
  const linkedList = createLinkedList<T>();

  return {
    dequeue(): T | null {
      'worklet';
      return linkedList.popLeft();
    },

    enqueue(value: T): void {
      'worklet';
      linkedList.append(value);
    },

    enqueueMany(values: Array<T>): void {
      'worklet';
      for (const value of values) {
        linkedList.append(value);
      }
    },

    isEmpty(): boolean {
      'worklet';
      return !linkedList.head();
    },

    length(): number {
      'worklet';
      return linkedList.length();
    },

    peek(): T | null {
      'worklet';
      const head = linkedList.head();
      if (!head) {
        return null;
      }

      return head.value;
    }
  };
};
