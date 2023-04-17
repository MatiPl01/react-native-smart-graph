import { SharedValue } from 'react-native-reanimated';

import { VertexRenderFunction } from '.';

export type DirectedEdgeRendererProps<E> = {
  key: string;
  data: E;
  from: SharedValue<{ x: number; y: number }>;
  to: SharedValue<{ x: number; y: number }>;
};

export type EdgeArrowRendererProps = {
  size: number;
  vertexPosition: SharedValue<{ x: number; y: number }>;
  tipPosition: SharedValue<{ x: number; y: number }>;
  centerPosition: SharedValue<{ x: number; y: number }>;
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
  edgeLabel?: DirectedEdgeRenderFunction<E>;
};

export type DirectedEdgeRenderers<E> = {
  edge: DirectedEdgeRenderFunction<E>;
  arrow: EdgeArrowRenderFunction;
  label?: DirectedEdgeRenderFunction<E>;
};
