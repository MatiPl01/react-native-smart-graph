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

export type GraphRenderers<V, E> = {
  vertex: VertexRenderFunction<V>;
  label?: EdgeLabelRendererFunction<E>;
  arrow?: EdgeArrowRenderFunction;
} & (
  | {
      edge: StraightEdgeRenderFunction<E>;
    }
  | {
      edge: CurvedEdgeRenderFunction<E>;
    }
);
