import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';

export type SharedRenderersProps = {
  animationProgress: SharedValue<number>;
  focusKey: SharedValue<null | string>;
  focusTransitionProgress: SharedValue<number>;
};

export type VertexRendererProps<V> = SharedRenderersProps & {
  currentRadius: SharedValue<number>;
  key: string;
  position: AnimatedVectorCoordinates;
  radius: number;
  scale: SharedValue<number>;
  value?: V;
};

export type VertexRenderFunction<V> = (
  props: VertexRendererProps<V>
) => JSX.Element | null;

export type EdgeLabelRendererProps<E> = SharedRenderersProps & {
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  edgeLength: SharedValue<number>;
  edgeRotation: SharedValue<number>;
  height: SharedValue<number>;
  key: string;
  value?: E;
};

export type EdgeLabelRendererFunction<E> = (
  props: EdgeLabelRendererProps<E>
) => JSX.Element | null;
