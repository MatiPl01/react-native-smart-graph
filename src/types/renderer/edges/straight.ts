import { AnimatedVector } from '@/types/layout';
import {
  EdgeLabelRendererFunction,
  SharedRenderersProps
} from '@/types/renderer/shared';

import { EdgeArrowRenderFunction } from './shared';

// STRAIGHT
export type StraightEdgeRendererProps<E> = SharedRenderersProps & {
  key: string;
  p1: AnimatedVector;
  p2: AnimatedVector;
  value: E;
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
  arrow: EdgeArrowRenderFunction;
  edge: StraightEdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
};
