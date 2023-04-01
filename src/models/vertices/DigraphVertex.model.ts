import { DirectedEdge, DigraphVertex as IDigraphVertex } from '@/types/graphs';

export default class DigraphVertex<V, E> implements IDigraphVertex<V, E> {
  private readonly inEdges$: Record<string, DirectedEdge<E, V>> = {};
  private readonly outEdges$: Record<string, DirectedEdge<E, V>> = {};

  constructor(private readonly key$: string, private readonly value$: V) {}

  get key(): string {
    return this.key$;
  }

  get value(): V {
    return this.value$;
  }

  get inEdges(): Array<DirectedEdge<E, V>> {
    return Object.values(this.inEdges$);
  }

  get outEdges(): Array<DirectedEdge<E, V>> {
    return Object.values(this.outEdges$);
  }

  get edges(): Array<DirectedEdge<E, V>> {
    return [...this.inEdges, ...this.outEdges];
  }

  get degree(): number {
    return this.edges.length;
  }

  get inDegree(): number {
    return this.inEdges.length;
  }

  get outDegree(): number {
    return this.outEdges.length;
  }

  addInEdge(edge: DirectedEdge<E, V>): void {
    if (edge.key in this.inEdges$) {
      throw new Error(`Edge with key ${edge.key} already exists.`);
    }
    this.inEdges$[edge.key] = edge;
  }

  addOutEdge(edge: DirectedEdge<E, V>): void {
    if (edge.key in this.outEdges$) {
      throw new Error(`Edge with key ${edge.key} already exists.`);
    }
    this.outEdges$[edge.key] = edge;
  }

  removeInEdge(key: string): DirectedEdge<E, V> {
    if (!(key in this.inEdges$)) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    const edge = this.inEdges$[key];
    delete this.inEdges$[key];
    return edge as DirectedEdge<E, V>;
  }

  removeOutEdge(key: string): DirectedEdge<E, V> {
    if (!(key in this.outEdges$)) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    const edge = this.outEdges$[key];
    delete this.outEdges$[key];
    return edge as DirectedEdge<E, V>;
  }
}
