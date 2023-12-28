import {
  UndirectedEdge as IUndirectedEdge,
  UndirectedGraphVertex
} from '@/types/models';

import Edge from './Edge';

export default class UndirectedEdge<V, E>
  extends Edge<V, E>
  implements IUndirectedEdge<V, E>
{
  constructor(
    key$: string,
    value$: E,
    private readonly vertices$: [
      UndirectedGraphVertex<V, E>,
      UndirectedGraphVertex<V, E>
    ]
  ) {
    super(key$, value$);
  }

  get isLoop(): boolean {
    return this.vertices[0].key === this.vertices[1].key;
  }

  get vertices(): [UndirectedGraphVertex<V, E>, UndirectedGraphVertex<V, E>] {
    return this.vertices$;
  }

  isDirected(): boolean {
    return false;
  }
}
