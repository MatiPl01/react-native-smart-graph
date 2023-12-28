import { SharedValue } from 'react-native-reanimated';

import { AnimatedPath, AnimatedVector } from '@/types/layout';

type SharedRenderersProps<P> = {
  animationProgress: SharedValue<number>;
  customProps: P;
};

/*
 * VERTEX
 */
export type VertexRendererProps<
  V = unknown,
  P = unknown
> = SharedRenderersProps<P> & {
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
  } | null;
  r: number;
  scale: SharedValue<number>;
  value: V;
};

export type VertexRenderer<V = unknown, P = unknown> = (
  props: VertexRendererProps<V, P>
) => JSX.Element | null;

/*
 * VERTEX LABEL
 */
export type VertexLabelRendererProps<
  V = unknown,
  P = unknown
> = SharedRenderersProps<P> & {
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
  } | null;
  onMeasure: (width: number, height: number) => void;
  r: number;
  value: V;
};

export type VertexLabelRenderer<V = unknown, P = unknown> = (
  props: VertexLabelRendererProps<V, P>
) => JSX.Element | null;

/*
 * VERTEX MASK
 */
export type VertexMaskRendererProps<P = unknown> = SharedRenderersProps<P> & {
  key: string;
  r: number;
};

export type VertexMaskRenderer<P = unknown> = (
  props: VertexMaskRendererProps<P>
) => JSX.Element | null;

/*
 * EDGE
 */
type SharedEdgeRendererProps<E, P = unknown> = SharedRenderersProps<P> & {
  focusProgress: SharedValue<number>;
  key: string;
  value: E;
};

export type StraightEdgeRendererProps<
  E = unknown,
  P = unknown
> = SharedEdgeRendererProps<E, P> & {
  p1: AnimatedVector;
  p2: AnimatedVector;
};

export type CurvedEdgeRendererProps<
  E = unknown,
  P = unknown
> = SharedEdgeRendererProps<E, P> & {
  path: AnimatedPath;
};

export type CurvedEdgeRenderer<E = unknown, P = unknown> = (
  props: CurvedEdgeRendererProps<E, P>
) => JSX.Element | null;

export type StraightEdgeRenderer<E = unknown, P = unknown> = (
  props: StraightEdgeRendererProps<E, P>
) => JSX.Element | null;

/*
 * EDGE LABEL
 */
export type EdgeLabelRendererProps<
  E = unknown,
  P = unknown
> = SharedRenderersProps<P> & {
  edgeLength: SharedValue<number>;
  edgeRotation: SharedValue<number>;
  key: string;
  onMeasure: (width: number, height: number) => void;
  r: number;
  value: E;
};

export type EdgeLabelRenderer<E = unknown, P = unknown> = (
  props: EdgeLabelRendererProps<E, P>
) => JSX.Element | null;

/*
 * EDGE ARROW
 */
export type EdgeArrowRendererProps<P = unknown> = SharedRenderersProps<P> & {
  s: number;
};

export type EdgeArrowRenderer<P = unknown> = (
  props: EdgeArrowRendererProps<P>
) => JSX.Element | null;
