import {
  UndirectedEdge as IUndirectedEdge,
  UndirectedGraphVertex
} from '@/types/models';

export default class UndirectedEdge<V, E> implements IUndirectedEdge<V, E> {
  constructor(
    private readonly key$: string,
    private readonly value$: E,
    private readonly vertices$: [
      UndirectedGraphVertex<V, E>,
      UndirectedGraphVertex<V, E>
    ]
  ) {}

  isDirected(): boolean {
    return false;
  }

  get isLoop(): boolean {
    return this.vertices[0].key === this.vertices[1].key;
  }

  get key(): string {
    return this.key$;
  }

  get value(): E {
    return this.value$;
  }

  get vertices(): [UndirectedGraphVertex<V, E>, UndirectedGraphVertex<V, E>] {
    return this.vertices$;
  }
}
