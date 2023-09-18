/* eslint-disable import/no-unused-modules */
import { GraphEdge } from '@/types/data';
import {
  DirectedGraphVertex,
  UndirectedGraphVertex,
  Vertex
} from '@/types/models/public/vertex';

export interface Edge<V = undefined, E = undefined> {
  get isLoop(): boolean;
  get key(): string;
  get value(): E;
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
  isDirected(): boolean;
}

export interface DirectedEdge<V = undefined, E = undefined> extends Edge<V, E> {
  get source(): DirectedGraphVertex<V, E>;
  get target(): DirectedGraphVertex<V, E>;
}

export interface UndirectedEdge<V = undefined, E = undefined>
  extends Edge<V, E> {
  get vertices(): [UndirectedGraphVertex<V, E>, UndirectedGraphVertex<V, E>];
}

export type OrderedEdges<
  V = undefined,
  E = undefined,
  GE extends GraphEdge<V, E> = GraphEdge<V, E>
> = Array<{
  edge: GE;
  edgesCount: number;
  order: number;
}>;
