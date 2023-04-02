import {
  DirectedEdge,
  DirectedGraphVertex as IDirectedGraphVertex
} from '@/types/graphs';

import Vertex from './Vertex.model';

export default class DirectedGraphVertex<V, E>
  extends Vertex<V, E>
  implements IDirectedGraphVertex<V, E>
{
  private readonly inEdges$: Record<string, DirectedEdge<E, V>> = {};
  private readonly outEdges$: Record<string, DirectedEdge<E, V>> = {};

  get inEdges(): Array<DirectedEdge<E, V>> {
    return Object.values(this.inEdges$);
  }

  get outEdges(): Array<DirectedEdge<E, V>> {
    return Object.values(this.outEdges$);
  }

  get edges(): Array<DirectedEdge<E, V>> {
    const result = Object.values(this.inEdges$);
    for (const edge of Object.values(this.outEdges$)) {
      if (!(edge.key in this.inEdges$)) {
        result.push(edge);
      }
    }
    return result;
  }

  get degree(): number {
    return this.inDegree + this.outDegree;
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

  removeInEdge(key: string) {
    if (!(key in this.inEdges$)) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    const edge = this.inEdges$[key];
    delete this.inEdges$[key];
    return edge as DirectedEdge<E, V>;
  }

  removeOutEdge(key: string) {
    if (!(key in this.outEdges$)) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    const edge = this.outEdges$[key];
    delete this.outEdges$[key];
    return edge as DirectedEdge<E, V>;
  }
}
