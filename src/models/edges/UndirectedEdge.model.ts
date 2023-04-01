import {
  UndirectedEdge as IUndirectedEdge,
  UndirectedGraphVertex
} from '@/types/graphs';

export default class UndirectedEdge<E, V> implements IUndirectedEdge<E, V> {
  constructor(
    private readonly key$: string,
    private readonly value$: E,
    private readonly vertices$: [
      UndirectedGraphVertex<V, E>,
      UndirectedGraphVertex<V, E>
    ]
  ) {}

  get key(): string {
    return this.key$;
  }

  get value(): E {
    return this.value$;
  }

  get vertices(): [UndirectedGraphVertex<V, E>, UndirectedGraphVertex<V, E>] {
    return this.vertices$;
  }

  get isLoop(): boolean {
    return this.vertices[0].key === this.vertices[1].key;
  }
}
