import { DirectedEdge, DirectedGraphVertex } from './directedGraph.types';
import { UndirectedEdge, UndirectedGraphVertex } from './undirectedGraph.types';

export * from './directedGraph.types';
export * from './shared.types';
export * from './undirectedGraph.types';

export type GraphVertex<V, E> =
  | DirectedGraphVertex<V, E>
  | UndirectedGraphVertex<V, E>;

export type GraphEdge<E, V> = DirectedEdge<E, V> | UndirectedEdge<E, V>;
