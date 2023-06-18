import { Edge, Vertex } from './shared';

export interface DirectedGraphVertex<V, E> extends Vertex<V, E> {
  addInEdge(edge: DirectedEdge<E, V>): void;
  addOutEdge(edge: DirectedEdge<E, V>): void;
  get inDegree(): number;
  get inEdges(): Array<DirectedEdge<E, V>>;
  get neighbors(): Array<DirectedGraphVertex<V, E>>;
  get outDegree(): number;
  get outEdges(): Array<DirectedEdge<E, V>>;
  removeInEdge(key: string): DirectedEdge<E, V>;
  removeOutEdge(key: string): DirectedEdge<E, V>;
}

export interface DirectedEdge<E, V> extends Edge<E, V> {
  get source(): DirectedGraphVertex<V, E>;
  get target(): DirectedGraphVertex<V, E>;
}
