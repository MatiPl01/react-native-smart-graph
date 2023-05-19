import { AnimatedPath, AnimatedVector } from '@/types/layout';

import { EdgeLabelRendererFunction } from '../shared';
import { EdgeArrowRenderFunction } from './shared';

export type CurvedEdgeRendererProps<E> = {
  key: string;
  data: E;
  p1: AnimatedVector;
  p2: AnimatedVector;
  controlPoint: AnimatedVector;
  path: AnimatedPath;
};

export type CurvedEdgeRenderFunction<E> = (
  props: CurvedEdgeRendererProps<E>
) => JSX.Element | null;

// Undirected edges
export type UndirectedCurvedEdgeRenderers<E> = {
  edge: CurvedEdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
};

// Directed edges
export type DirectedCurvedEdgeRenderers<E> = {
  edge: CurvedEdgeRenderFunction<E>;
  arrow: EdgeArrowRenderFunction;
  label?: EdgeLabelRendererFunction<E>;
};
