/* eslint-disable import/no-unused-modules */
import {
  DirectedGraphVertex,
  UndirectedGraphVertex,
  Vertex
} from '@/types/models/public/vertex';

export interface Edge<V, E> {
  get isLoop(): boolean;
  get key(): string;
  get value(): E | undefined;
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
  isDirected(): boolean;
}

export interface DirectedEdge<V, E> extends Edge<V, E> {
  get source(): DirectedGraphVertex<V, E>;
  get target(): DirectedGraphVertex<V, E>;
}

export interface UndirectedEdge<V, E> extends Edge<V, E> {
  get vertices(): [UndirectedGraphVertex<V, E>, UndirectedGraphVertex<V, E>];
}

export type OrderedEdges<V = void, E = void> = Array<{
  edge: Edge<V, E>;
  edgesCount: number;
  order: number;
}>;
