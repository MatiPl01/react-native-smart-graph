/* eslint-disable import/no-unused-modules */

import { DirectedEdge, Edge, UndirectedEdge } from './edge';

export interface Vertex<V = void, E = void> {
  get degree(): number;
  get edges(): Array<Edge<V, E>>;
  get key(): string;
  get neighbors(): Array<Vertex<V, E>>;
  get value(): V;
}

export interface DirectedGraphVertex<V = void, E = void> extends Vertex<V, E> {
  addInEdge(edge: DirectedEdge<V, E>): void;
  addOutEdge(edge: DirectedEdge<V, E>): void;
  get inDegree(): number;
  get inEdges(): Array<DirectedEdge<V, E>>;
  get neighbors(): Array<DirectedGraphVertex<V, E>>;
  get outDegree(): number;
  get outEdges(): Array<DirectedEdge<V, E>>;
  removeInEdge(key: string): DirectedEdge<V, E>;
  removeOutEdge(key: string): DirectedEdge<V, E>;
}

export interface UndirectedGraphVertex<V = void, E = void>
  extends Vertex<V, E> {
  addEdge(edge: UndirectedEdge<V, E>): void;
  removeEdge(key: string): UndirectedEdge<V, E>;
}

export type VertexConnections = {
  // Undirected graphs have no incoming connections (an array will be empty)
  incoming: Array<string>;
  outgoing: Array<string>;
};
