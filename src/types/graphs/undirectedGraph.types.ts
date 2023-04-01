import { Edge, Vertex } from './shared.types';

export interface UndirectedGraphVertex<V, E> extends Vertex<V, E> {
  addEdge(edge: UndirectedEdge<E, V>): void;
  removeEdge(key: string): UndirectedEdge<E, V>;
}

export interface UndirectedEdge<E, V> extends Edge<E> {
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
}
