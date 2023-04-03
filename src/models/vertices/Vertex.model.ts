import { Edge, Vertex as IVertex } from '@/types/graphs';

export default abstract class Vertex<V, E> implements IVertex<V, E> {
  constructor(private readonly key$: string, private readonly value$: V) {}

  get key(): string {
    return this.key$;
  }

  get value(): V {
    return this.value$;
  }

  abstract get edges(): Array<Edge<E>>;

  abstract get degree(): number;
}
