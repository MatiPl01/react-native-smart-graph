import { Edge as IEdge, EdgeObserver, Vertex } from '@/types/models';

export default abstract class Edge<V, E> implements IEdge<V, E> {
  private readonly observers = new Set<EdgeObserver<E>>();

  constructor(
    private readonly key$: string,
    private value$: E
  ) {}

  get key(): string {
    return this.key$;
  }

  get value(): E {
    return this.value$;
  }

  set value(value: E) {
    this.value$ = value;
    this.observers.forEach(observer => observer.valueChanged?.(value));
  }

  addObserver(observer: EdgeObserver<E>): void {
    this.observers.add(observer);
  }

  removeObserver(observer: EdgeObserver<E>) {
    this.observers.delete(observer);
  }

  abstract isDirected(): boolean;

  abstract get isLoop(): boolean;

  abstract get vertices(): [Vertex<V, E>, Vertex<V, E>];
}
