import { Edge, Vertex } from './shared.types';

export interface DigraphVertex<V, E> extends Vertex<V, E> {
  get inEdges(): Array<DirectedEdge<E, V>>;
  get outEdges(): Array<DirectedEdge<E, V>>;
  addInEdge(edge: DirectedEdge<E, V>): void;
  addOutEdge(edge: DirectedEdge<E, V>): void;
  removeInEdge(key: string): DirectedEdge<E, V>;
  removeOutEdge(key: string): DirectedEdge<E, V>;
}

export interface DirectedEdge<E, V> extends Edge<E> {
  get source(): DigraphVertex<V, E>;
  get target(): DigraphVertex<V, E>;
}
