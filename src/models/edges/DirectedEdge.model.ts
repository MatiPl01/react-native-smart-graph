import { DigraphVertex, DirectedEdge as IDirectedEdge } from '@/types/graphs';

export default class DirectedEdge<E, V> implements IDirectedEdge<E, V> {
  constructor(
    private readonly key$: string,
    private readonly value$: E,
    private readonly source$: DigraphVertex<V, E>,
    private readonly target$: DigraphVertex<V, E>
  ) {}

  get source(): DigraphVertex<V, E> {
    return this.source$;
  }

  get target(): DigraphVertex<V, E> {
    return this.target$;
  }

  get key(): string {
    return this.key$;
  }

  get value(): E {
    return this.value$;
  }
}
