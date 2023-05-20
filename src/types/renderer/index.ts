import {
  CurvedEdgeRenderFunction,
  CurvedEdgeRendererProps
} from './edges/curved';
import { EdgeArrowRenderFunction } from './edges/shared';
import {
  StraightEdgeRenderFunction,
  StraightEdgeRendererProps
} from './edges/straight';
import { EdgeLabelRendererFunction, VertexRenderFunction } from './shared';

export * from './edges/straight';
export * from './edges/curved';
export * from './edges/shared';
export * from './shared';

export type EdgeRendererProps<E> =
  | StraightEdgeRendererProps<E>
  | CurvedEdgeRendererProps<E>;

export type EdgeRenderFunction<E> =
  | StraightEdgeRenderFunction<E>
  | CurvedEdgeRenderFunction<E>;

type SharedGraphRenderers<V, E> = {
  vertex?: VertexRenderFunction<V>;
  edge?: EdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
};

export type DirectedGraphRenderers<V, E> = SharedGraphRenderers<V, E> & {
  arrow?: EdgeArrowRenderFunction;
};

export type UndirectedGraphRenderers<V, E> = SharedGraphRenderers<V, E>;

export type GraphRenderers<V, E> =
  | DirectedGraphRenderers<V, E>
  | UndirectedGraphRenderers<V, E>;
