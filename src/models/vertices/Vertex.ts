import { Edge, Vertex as IVertex, VertexObserver } from '@/types/models';

export default abstract class Vertex<V, E> implements IVertex<V, E> {
  private readonly observers = new Set<VertexObserver<V>>();

  constructor(
    private readonly key$: string,
    private value$: V
  ) {}

  get key(): string {
    return this.key$;
  }

  get value(): V {
    return this.value$;
  }

  set value(value: V) {
    this.observers.forEach(observer => {
      observer.valueChanged?.(value);
    });
    this.value$ = value;
  }

  addObserver(observer: VertexObserver<V>): void {
    this.observers.add(observer);
  }

  removeObserver(observer: VertexObserver<V>): void {
    this.observers.delete(observer);
  }

  abstract get degree(): number;

  abstract get edges(): Array<Edge<V, E>>;

  abstract get neighbors(): Array<IVertex<V, E>>;
}
