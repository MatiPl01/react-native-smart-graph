import {
  DirectedEdgeRenderFunction,
  DirectedEdgeRendererProps,
  DirectedGraphRenderers
} from './directedGraph';
import {
  UndirectedEdgeRenderFunction,
  UndirectedEdgeRendererProps,
  UndirectedGraphRenderers
} from './undirectedGraph';

export * from './directedGraph';
export * from './shared';
export * from './undirectedGraph';

export type EdgeRendererProps<E> =
  | DirectedEdgeRendererProps<E>
  | UndirectedEdgeRendererProps<E>;

export type EdgeRenderFunction<E> =
  | DirectedEdgeRenderFunction<E>
  | UndirectedEdgeRenderFunction<E>;

export type GraphRenderers<V, E> =
  | DirectedGraphRenderers<V, E>
  | UndirectedGraphRenderers<V, E>;
