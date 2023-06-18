import {
  UndirectedEdge,
  UndirectedGraphVertex as IUndirectedGraphVertex
} from '@/types/graphs';

import Vertex from './Vertex';

export default class UndirectedGraphVertex<V, E> extends Vertex<V, E> {
  private readonly edges$: Record<string, UndirectedEdge<E, V>> = {};

  addEdge(edge: UndirectedEdge<E, V>): void {
    if (edge.key in this.edges$) {
      throw new Error(`Edge with key ${edge.key} already exists.`);
    }
    this.edges$[edge.key] = edge;
  }

  get degree(): number {
    return this.edges.reduce((acc, edge) => acc + (edge.isLoop ? 2 : 1), 0);
  }

  get edges(): Array<UndirectedEdge<E, V>> {
    return Object.values(this.edges$);
  }

  get neighbors(): Array<IUndirectedGraphVertex<V, E>> {
    return Object.values(this.edges).map(({ vertices }) =>
      vertices[0].key === this.key ? vertices[1] : vertices[0]
    );
  }

  removeEdge(key: string): UndirectedEdge<E, V> {
    if (!(key in this.edges$)) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    const edge = this.edges$[key];
    delete this.edges$[key];
    return edge as UndirectedEdge<E, V>;
  }
}
