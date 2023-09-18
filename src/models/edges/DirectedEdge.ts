import {
  DirectedEdge as IDirectedEdge,
  DirectedGraphVertex
} from '@/types/models';

export default class DirectedEdge<V, E> implements IDirectedEdge<V, E> {
  constructor(
    private readonly key$: string,
    private readonly value$: E,
    private readonly source$: DirectedGraphVertex<V, E>,
    private readonly target$: DirectedGraphVertex<V, E>
  ) {}

  isDirected() {
    return true;
  }

  get isLoop(): boolean {
    return this.source.key === this.target.key;
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
