import { SharedValue } from 'react-native-reanimated';

import { EdgeLabelRendererFunction, VertexRenderFunction } from '.';
import { AnimatedVector } from '../layout';

export type DirectedEdgeRendererProps<E> = {
  key: string;
  data: E;
  from: AnimatedVector;
  to: AnimatedVector;
};

export type EdgeArrowRendererProps = {
  size: SharedValue<number>;
  vertexPosition: AnimatedVector;
  tipPosition: AnimatedVector;
  centerPosition: AnimatedVector;
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
