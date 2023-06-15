import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';

export type SharedRenderersProps = {
  animationProgress: SharedValue<number>;
};

export type VertexRendererProps<V> = SharedRenderersProps & {
  key: string;
  data: V;
  radius: number;
  currentRadius: SharedValue<number>;
  scale: SharedValue<number>;
  position: AnimatedVectorCoordinates;
};

export type VertexRenderFunction<V> = (
  props: VertexRendererProps<V>
) => JSX.Element | null;

export type EdgeLabelRendererProps<E> = SharedRenderersProps & {
  key: string;
  data: E;
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  height: SharedValue<number>;
  edgeRotation: SharedValue<number>;
  edgeLength: SharedValue<number>;
};

export type EdgeLabelRendererFunction<E> = (
  props: EdgeLabelRendererProps<E>
) => JSX.Element | null;
