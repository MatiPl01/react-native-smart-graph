import {
  DirectedEdge,
  DirectedGraphVertex as IDirectedGraphVertex
} from '@/types/graphs';

import Vertex from './Vertex';

export default class DirectedGraphVertex<V, E>
  extends Vertex<V, E>
  implements IDirectedGraphVertex<V, E>
{
  private readonly inEdges$: Record<string, DirectedEdge<V, E>> = {};
  private readonly outEdges$: Record<string, DirectedEdge<V, E>> = {};

  addInEdge(edge: DirectedEdge<V, E>): void {
    if (edge.key in this.inEdges$) {
      throw new Error(`Edge with key ${edge.key} already exists.`);
    }
    this.inEdges$[edge.key] = edge;
  }

  addOutEdge(edge: DirectedEdge<V, E>): void {
    if (edge.key in this.outEdges$) {
      throw new Error(`Edge with key ${edge.key} already exists.`);
    }
    this.outEdges$[edge.key] = edge;
  }

  get degree(): number {
    return this.inDegree + this.outDegree;
  }

  get edges(): Array<DirectedEdge<V, E>> {
    const result = Object.values(this.inEdges$);
    for (const edge of Object.values(this.outEdges$)) {
      if (!(edge.key in this.inEdges$)) {
        result.push(edge);
      }
    }
    return result;
  }

  get inDegree(): number {
    return this.inEdges.length;
  }

  get inEdges(): Array<DirectedEdge<V, E>> {
    return Object.values(this.inEdges$);
  }

  get neighbors(): Array<IDirectedGraphVertex<V, E>> {
    return Object.values(this.outEdges$).map(edge => edge.target);
  }

  get outDegree(): number {
    return this.outEdges.length;
  }

  get outEdges(): Array<DirectedEdge<V, E>> {
    return Object.values(this.outEdges$);
  }

  removeInEdge(key: string) {
    if (!(key in this.inEdges$)) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    const edge = this.inEdges$[key];
    delete this.inEdges$[key];
    return edge as DirectedEdge<V, E>;
  }

  removeOutEdge(key: string) {
    if (!(key in this.outEdges$)) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    const edge = this.outEdges$[key];
    delete this.outEdges$[key];
    return edge as DirectedEdge<V, E>;
  }
}
