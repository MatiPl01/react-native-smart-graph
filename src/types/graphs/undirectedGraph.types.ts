import { Edge, Vertex } from './shared.types';

export interface UndirectedEdge<E, V> extends Edge<E> {
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
}
