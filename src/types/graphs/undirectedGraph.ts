import { Edge, Vertex } from './shared';

export interface UndirectedGraphVertex<V, E> extends Vertex<V, E> {
  addEdge(edge: UndirectedEdge<E, V>): void;
  removeEdge(key: string): UndirectedEdge<E, V>;
}

export interface UndirectedEdge<E, V> extends Edge<E, V> {
  get isLoop(): boolean;
  get vertices(): [UndirectedGraphVertex<V, E>, UndirectedGraphVertex<V, E>];
}
