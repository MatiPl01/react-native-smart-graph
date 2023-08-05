import { SharedValue } from 'react-native-reanimated';

import { AnimatedPath } from '@/types/layout';
import {
  EdgeLabelRendererFunction,
  SharedRenderersProps
} from '@/types/renderers/shared';

import { EdgeArrowRenderFunction } from './shared';

export type CurvedEdgeRendererProps<E> = SharedRenderersProps & {
  key: string;
  parabolaX: SharedValue<number>;
  parabolaY: SharedValue<number>;
  path: AnimatedPath;
  value?: E;
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
  arrow: EdgeArrowRenderFunction;
  edge: CurvedEdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
};
