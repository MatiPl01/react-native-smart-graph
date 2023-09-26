/* eslint-disable import/no-unused-modules */
import { SharedValue } from 'react-native-reanimated';

import { AnimatedPath, AnimatedVector } from '@/types/layout';

import { VertexMaskRenderer } from './mask';

type SharedRenderersProps = {
  animationProgress: SharedValue<number>;
};

/*
 * VERTEX
 */
export type VertexRendererProps<V = undefined> = SharedRenderersProps & {
  focus: {
    key: SharedValue<null | string>;
    progress: SharedValue<number>;
  };
  key: string;
  multiStepFocus: {
    bounds: SharedValue<{
      afterIdx: number;
      beforeIdx: number;
    }>;
    points: SharedValue<Array<{ key: string; startsAt: number }>>;
    progress: SharedValue<number>;
  };
  r: number;
  scale: SharedValue<number>;
  value: V;
};

export type VertexRenderer<V = undefined> = (
  props: VertexRendererProps<V>
) => JSX.Element | null;

/*
 * VERTEX LABEL
 */
export type VertexLabelRendererProps<V = undefined> = SharedRenderersProps & {
  key: string;
  r: number;
  scale: SharedValue<number>;
  value: V;
  vertexRadius: number;
  vertexScale: SharedValue<number>;
};

export type VertexLabelRenderer<V = undefined> = (
  props: VertexLabelRendererProps<V>
) => JSX.Element | null;

/*
 * EDGE
 */
type SharedEdgeRendererProps<E> = SharedRenderersProps & {
  focusProgress: SharedValue<number>;
  key: string;
  value: E;
};

export type StraightEdgeRendererProps<E = undefined> =
  SharedEdgeRendererProps<E> & {
    p1: AnimatedVector;
    p2: AnimatedVector;
  };

export type CurvedEdgeRendererProps<E = undefined> =
  SharedEdgeRendererProps<E> & {
    path: AnimatedPath;
  };

export type CurvedEdgeRenderer<E = undefined> = (
  props: CurvedEdgeRendererProps<E>
) => JSX.Element | null;

export type StraightEdgeRenderer<E = undefined> = (
  props: StraightEdgeRendererProps<E>
) => JSX.Element | null;

/*
 * EDGE LABEL
 */
export type EdgeLabelRendererProps<E = undefined> = SharedRenderersProps & {
  edgeLength: SharedValue<number>;
  edgeRotation: SharedValue<number>;
  key: string;
  r: number;
  value: E;
};

export type EdgeLabelRenderer<E> = (
  props: EdgeLabelRendererProps<E>
) => JSX.Element | null;

/*
 * EDGE ARROW
 */
export type EdgeArrowRendererProps = SharedRenderersProps & {
  s: number;
};

export type EdgeArrowRenderer = (
  props: EdgeArrowRendererProps
) => JSX.Element | null;

/*
 * GRAPH
 */
type SharedUndirectedGraphRenderers<V, E> = {
  label: EdgeLabelRenderer<E> | null;
  vertex: VertexRenderer<V> | null;
  vertexMask: VertexMaskRenderer | null;
};

type SharedDirectedGraphRenderers<V, E> = SharedUndirectedGraphRenderers<
  V,
  E
> & {
  arrow: EdgeArrowRenderer | null;
};

export type UndirectedGraphWithStraightEdgeRenderers<V, E> =
  SharedUndirectedGraphRenderers<V, E> & {
    edge: StraightEdgeRenderer<E>;
  };

export type UndirectedGraphWithCurvedEdgeRenderers<V, E> =
  SharedUndirectedGraphRenderers<V, E> & {
    edge: CurvedEdgeRenderer<E>;
  };

export type DirectedGraphWithStraightEdgeRenderers<V, E> =
  SharedDirectedGraphRenderers<V, E> & {
    edge: StraightEdgeRenderer<E>;
  };

export type DirectedGraphWithCurvedEdgeRenderers<V, E> =
  SharedDirectedGraphRenderers<V, E> & {
    edge: CurvedEdgeRenderer<E>;
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
