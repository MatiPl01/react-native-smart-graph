import UndirectedEdge from '../edges/UndirectedEdge.model';
import Vertex from './Vertex.model';

export default class UndirectedGraphVertex<V, E> extends Vertex<V, E> {
  private readonly edges$: Record<string, UndirectedEdge<E, V>> = {};

  get edges(): Array<UndirectedEdge<E, V>> {
    return Object.values(this.edges$);
  }

  get degree(): number {
    return this.edges.reduce((acc, edge) => acc + (edge.isLoop ? 2 : 1), 0);
  }

  addEdge(edge: UndirectedEdge<E, V>): void {
    if (edge.key in this.edges$) {
      throw new Error(`Edge with key ${edge.key} already exists.`);
    }
    this.edges$[edge.key] = edge;
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
