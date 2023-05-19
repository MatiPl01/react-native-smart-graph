import { AnimatedVector } from '@/types/layout';

import { EdgeLabelRendererFunction } from '../shared';
import { EdgeArrowRenderFunction } from './shared';

// STRAIGHT
export type StraightEdgeRendererProps<E> = {
  key: string;
  data: E;
  p1: AnimatedVector;
  p2: AnimatedVector;
};

export type StraightEdgeRenderFunction<E> = (
  props: StraightEdgeRendererProps<E>
) => JSX.Element | null;

// Undirected edges
export type UndirectedStraightEdgeRenderers<E> = {
  edge: StraightEdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
};

// Directed edges
export type DirectedStraightEdgeRenderers<E> = {
  edge: StraightEdgeRenderFunction<E>;
  arrow: EdgeArrowRenderFunction;
  label?: EdgeLabelRendererFunction<E>;
};
