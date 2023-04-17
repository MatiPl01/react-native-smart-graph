import { Edge, Vertex } from './shared.';

export interface DirectedGraphVertex<V, E> extends Vertex<V, E> {
  get inEdges(): Array<DirectedEdge<E, V>>;
  get outEdges(): Array<DirectedEdge<E, V>>;
  get inDegree(): number;
  get outDegree(): number;
  addInEdge(edge: DirectedEdge<E, V>): void;
  addOutEdge(edge: DirectedEdge<E, V>): void;
  removeInEdge(key: string): DirectedEdge<E, V>;
  removeOutEdge(key: string): DirectedEdge<E, V>;
}

export interface DirectedEdge<E, V> extends Edge<E, V> {
  get source(): DirectedGraphVertex<V, E>;
  get target(): DirectedGraphVertex<V, E>;
}
