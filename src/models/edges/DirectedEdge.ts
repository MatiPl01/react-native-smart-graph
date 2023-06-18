import {
  DirectedEdge as IDirectedEdge,
  DirectedGraphVertex
} from '@/types/graphs';

export default class DirectedEdge<E, V> implements IDirectedEdge<E, V> {
  constructor(
    private readonly key$: string,
    private readonly value$: E,
    private readonly source$: DirectedGraphVertex<V, E>,
    private readonly target$: DirectedGraphVertex<V, E>
  ) {}

  isDirected() {
    return true;
  }

  get key(): string {
    return this.key$;
  }

  get source(): DirectedGraphVertex<V, E> {
    return this.source$;
  }

  get target(): DirectedGraphVertex<V, E> {
    return this.target$;
  }

  get value(): E {
    return this.value$;
  }

  get vertices(): [DirectedGraphVertex<V, E>, DirectedGraphVertex<V, E>] {
    return [this.source, this.target];
  }
}
