import PriorityQueue from './PriorityQueue';

export default class MinPriorityQueue<T> extends PriorityQueue<T> {
  constructor() {
    super((a, b) => a - b);
  }
}
