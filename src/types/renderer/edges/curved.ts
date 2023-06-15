import { SharedValue } from 'react-native-reanimated';

import { AnimatedPath } from '@/types/layout';
import {
  EdgeLabelRendererFunction,
  SharedRenderersProps
} from '@/types/renderer/shared';

import { EdgeArrowRenderFunction } from './shared';

export type CurvedEdgeRendererProps<E> = SharedRenderersProps & {
  key: string;
  data: E;
  parabolaX: SharedValue<number>;
  parabolaY: SharedValue<number>;
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
