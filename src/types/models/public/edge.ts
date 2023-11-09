/* eslint-disable import/no-unused-modules */
import { GraphEdge } from '@/types/data';
import {
  DirectedGraphVertex,
  UndirectedGraphVertex,
  Vertex
} from '@/types/models/public/vertex';

import { EdgeObserver } from './observer';

export interface Edge<V = unknown, E = unknown> {
  addObserver(observer: EdgeObserver<E>): void;
  get isLoop(): boolean;
  get key(): string;
  get value(): E;
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
  isDirected(): boolean;
  removeObserver(observer: EdgeObserver<E>): void;
  set value(value: E);
}

export interface DirectedEdge<V = unknown, E = unknown> extends Edge<V, E> {
  get source(): DirectedGraphVertex<V, E>;
  get target(): DirectedGraphVertex<V, E>;
}

export interface UndirectedEdge<V = unknown, E = unknown> extends Edge<V, E> {
  get vertices(): [UndirectedGraphVertex<V, E>, UndirectedGraphVertex<V, E>];
}

export type OrderedEdges<
  V = unknown,
  E = unknown,
  GE extends GraphEdge<V, E> = GraphEdge<V, E>
> = Array<{
  edge: GE;
  edgesCount: number;
  order: number;
}>;
