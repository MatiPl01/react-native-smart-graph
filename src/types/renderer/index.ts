import {
  DirectedEdgeRenderFunction,
  DirectedEdgeRendererProps,
  DirectedGraphRenderers
} from './directedGraph';
import { VertexRendererProps } from './shared';
import {
  UndirectedEdgeRenderFunction,
  UndirectedEdgeRendererProps,
  UndirectedGraphRenderers
} from './undirectedGraph';

export * from './shared';
export * from './directedGraph';
export * from './undirectedGraph';

export type EdgeRendererProps<E> =
  | DirectedEdgeRendererProps<E>
  | UndirectedEdgeRendererProps<E>;

// TODO
export type EdgeLabelRendererProps<E> = EdgeRendererProps<E>;

export type VertexRenderFunction<V> = (
  props: VertexRendererProps<V>
) => JSX.Element | null;

export type EdgeRenderFunction<E> =
  | DirectedEdgeRenderFunction<E>
  | UndirectedEdgeRenderFunction<E>;

export type EdgeLabelRendererFunction<E> = (
  props: EdgeLabelRendererProps<E>
) => JSX.Element | null;

export type GraphRenderers<V, E> =
  | DirectedGraphRenderers<V, E>
  | UndirectedGraphRenderers<V, E>;
