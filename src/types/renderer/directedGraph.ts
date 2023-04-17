import { SharedValue } from 'react-native-reanimated';

import { EdgeLabelRendererFunction, VertexRenderFunction } from '.';
import { AnimatedPosition } from '../layout';

export type DirectedEdgeRendererProps<E> = {
  key: string;
  data: E;
  from: AnimatedPosition;
  to: AnimatedPosition;
};

export type EdgeArrowRendererProps = {
  size: number;
  vertexPosition: AnimatedPosition;
  tipPosition: AnimatedPosition;
  centerPosition: AnimatedPosition;
  rotation: SharedValue<number>;
};

export type DirectedEdgeRenderFunction<E> = (
  props: DirectedEdgeRendererProps<E>
) => JSX.Element | null;

export type EdgeArrowRenderFunction = (
  props: EdgeArrowRendererProps
) => JSX.Element | null;

export type DirectedGraphRenderers<V, E> = {
  vertex?: VertexRenderFunction<V>;
  edge?: DirectedEdgeRenderFunction<E>;
  edgeArrow?: EdgeArrowRenderFunction;
  edgeLabel?: EdgeLabelRendererFunction<E>;
};

export type DirectedEdgeRenderers<E> = {
  edge: DirectedEdgeRenderFunction<E>;
  arrow: EdgeArrowRenderFunction;
  label?: EdgeLabelRendererFunction<E>;
};
