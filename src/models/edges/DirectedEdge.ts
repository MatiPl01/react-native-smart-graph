import {
  DirectedEdge as IDirectedEdge,
  DirectedGraphVertex
} from '@/types/models';

import Edge from './Edge';

export default class DirectedEdge<V, E>
  extends Edge<V, E>
  implements IDirectedEdge<V, E>
{
  constructor(
    key$: string,
    value$: E,
    private readonly source$: DirectedGraphVertex<V, E>,
    private readonly target$: DirectedGraphVertex<V, E>
  ) {
    super(key$, value$);
  }

  get isLoop(): boolean {
    return this.source.key === this.target.key;
  }

  get source(): DirectedGraphVertex<V, E> {
    return this.source$;
  }

  get target(): DirectedGraphVertex<V, E> {
    return this.target$;
  }

  get vertices(): [DirectedGraphVertex<V, E>, DirectedGraphVertex<V, E>] {
    return [this.source, this.target];
  }

  isDirected() {
    return true;
  }
}
