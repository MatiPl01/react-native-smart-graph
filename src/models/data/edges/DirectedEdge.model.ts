import {
  DirectedGraphVertex,
  DirectedEdge as IDirectedEdge
} from '@/types/models';

export default class DirectedEdge<E, V> implements IDirectedEdge<E, V> {
  constructor(
    private readonly key$: string,
    private readonly value$: E,
    private readonly source$: DirectedGraphVertex<V, E>,
    private readonly target$: DirectedGraphVertex<V, E>
  ) {}

  get source(): DirectedGraphVertex<V, E> {
    return this.source$;
  }

  get target(): DirectedGraphVertex<V, E> {
    return this.target$;
  }

  get key(): string {
    return this.key$;
  }

  get value(): E {
    return this.value$;
  }
}
