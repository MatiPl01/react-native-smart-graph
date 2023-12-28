import { DirectedEdge, Edge, UndirectedEdge } from './edge';
import { VertexObserver } from './observer';

export interface Vertex<V = unknown, E = unknown> {
  addObserver(observer: VertexObserver<V>): void;
  get degree(): number;
  get edges(): Array<Edge<V, E>>;
  get key(): string;
  get neighbors(): Array<Vertex<V, E>>;
  get value(): V;
  removeObserver(observer: VertexObserver<V>): void;
  set value(value: V);
}

export interface DirectedGraphVertex<V = unknown, E = unknown>
  extends Vertex<V, E> {
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

export interface UndirectedGraphVertex<V = unknown, E = unknown>
  extends Vertex<V, E> {
  addEdge(edge: UndirectedEdge<V, E>): void;
  removeEdge(key: string): UndirectedEdge<V, E>;
}

export type VertexConnections = {
  // Undirected graphs have no incoming connections (an array will be empty)
  incoming: Array<string>;
  outgoing: Array<string>;
};
