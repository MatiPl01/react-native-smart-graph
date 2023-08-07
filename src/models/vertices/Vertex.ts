import { Edge, Vertex as IVertex } from '@/types/models';

export default abstract class Vertex<V, E> implements IVertex<V, E> {
  constructor(
    private readonly key$: string,
    private readonly value$: V | undefined
  ) {}

  get key(): string {
    return this.key$;
  }

  get value(): V | undefined {
    return this.value$;
  }

  abstract get degree(): number;

  abstract get edges(): Array<Edge<V, E>>;

  abstract get neighbors(): Array<IVertex<V, E>>;
}
