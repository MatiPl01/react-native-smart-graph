/* eslint-disable import/no-unused-modules */
import { SharedValue } from 'react-native-reanimated';

import { AnimatedPath, AnimatedVector } from '@/types/layout';

type SharedRenderersProps = {
  animationProgress: SharedValue<number>;
};

/*
 * VERTEX
 */
export type VertexRendererProps<V> = SharedRenderersProps & {
  focusKey: SharedValue<null | string>;
  focusProgress: SharedValue<number>;
  key: string;
  r: number;
  scale: SharedValue<number>;
  value?: V;
};

export type VertexRenderer<V> = (
  props: VertexRendererProps<V>
) => JSX.Element | null;

/*
 * EDGE
 */
type SharedEdgeRendererProps<E> = SharedRenderersProps & {
  key: string;
  value?: E;
};

export type StraightEdgeRendererProps<E> = SharedEdgeRendererProps<E> & {
  p1: AnimatedVector;
  p2: AnimatedVector;
};

export type CurvedEdgeRendererProps<E> = SharedEdgeRendererProps<E> & {
  path: AnimatedPath;
};

export type CurvedEdgeRenderer<E> = (
  props: CurvedEdgeRendererProps<E>
) => JSX.Element | null;

export type StraightEdgeRenderer<E> = (
  props: StraightEdgeRendererProps<E>
) => JSX.Element | null;

/*
 * LABEL
 */
export type LabelRendererProps<E> = SharedRenderersProps & {
  edgeLength: SharedValue<number>;
  edgeRotation: SharedValue<number>;
  key: string;
  value?: E;
};

export type LabelRenderer<E> = (
  props: LabelRendererProps<E>
) => JSX.Element | null;

/*
 * ARROW
 */
export type ArrowRendererProps = SharedRenderersProps & {
  edgeRotation: SharedValue<number>;
  s: number;
  scale: SharedValue<number>;
};

export type ArrowRenderer = (props: ArrowRendererProps) => JSX.Element | null;

/*
 * GRAPH
 */
type SharedUndirectedGraphRenderers<V, E> = {
  label?: LabelRenderer<E>;
  vertex?: VertexRenderer<V>;
};

type SharedDirectedGraphRenderers<V, E> = SharedUndirectedGraphRenderers<
  V,
  E
> & {
  arrow?: ArrowRenderer;
};

export type UndirectedGraphWithStraightEdgeRenderers<V, E> =
  SharedUndirectedGraphRenderers<V, E> & {
    edge?: StraightEdgeRenderer<E>;
  };

export type UndirectedGraphWithCurvedEdgeRenderers<V, E> =
  SharedUndirectedGraphRenderers<V, E> & {
    edge?: CurvedEdgeRenderer<E>;
  };

export type DirectedGraphWithStraightEdgeRenderers<V, E> =
  SharedDirectedGraphRenderers<V, E> & {
    edge?: StraightEdgeRenderer<E>;
  };

export type DirectedGraphWithCurvedEdgeRenderers<V, E> =
  SharedDirectedGraphRenderers<V, E> & {
    edge?: CurvedEdgeRenderer<E>;
  };

export type UndirectedGraphRenderers<V, E> =
  | UndirectedGraphWithCurvedEdgeRenderers<V, E>
  | UndirectedGraphWithStraightEdgeRenderers<V, E>;

export type DirectedGraphRenderers<V, E> =
  | DirectedGraphWithCurvedEdgeRenderers<V, E>
  | DirectedGraphWithStraightEdgeRenderers<V, E>;

export type GraphRenderers<V, E> =
  | DirectedGraphRenderers<V, E>
  | UndirectedGraphRenderers<V, E>;
