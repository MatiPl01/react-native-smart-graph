import { CurvedEdgeRenderFunction } from './edges/curved';
import { EdgeArrowRenderFunction } from './edges/shared';
import { StraightEdgeRenderFunction } from './edges/straight';
import { EdgeLabelRendererFunction, VertexRenderFunction } from './shared';

export * from './edges/curved';
export * from './edges/shared';
export * from './edges/straight';
export * from './shared';

export type EdgeRenderFunction<E> =
  | CurvedEdgeRenderFunction<E>
  | StraightEdgeRenderFunction<E>;

type SharedGraphRenderers<V, E> = {
  edge?: EdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
  vertex?: VertexRenderFunction<V>;
};

export type DirectedGraphRenderers<V, E> = SharedGraphRenderers<V, E> & {
  arrow?: EdgeArrowRenderFunction;
};

export type UndirectedGraphRenderers<V, E> = SharedGraphRenderers<V, E>;

export type GraphRenderers<V, E> =
  | DirectedGraphRenderers<V, E>
  | UndirectedGraphRenderers<V, E>;

export type GraphRenderersWithDefaults<V, E> = {
  arrow?: EdgeArrowRenderFunction;
  edge: EdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
  vertex: VertexRenderFunction<V>;
};
