import { SharedValue } from 'react-native-reanimated';

import { AnimatedVector, AnimatedVectorCoordinates } from '../layout';

export type SharedRenderersProps = {
  removed: boolean;
  animationProgress: SharedValue<number>;
};

export type VertexRendererProps<V> = SharedRenderersProps & {
  key: string;
  data: V;
  radius: number;
  position: AnimatedVectorCoordinates;
  removed: boolean;
  animationProgress: SharedValue<number>;
};

export type VertexRenderFunction<V> = (
  props: VertexRendererProps<V>
) => JSX.Element | null;

export type EdgeLabelRendererProps<E> = SharedRenderersProps & {
  key: string;
  data: E;
  vertexRadius: number;
  centerPosition: AnimatedVector;
  maxSize: SharedValue<number>;
  edgeRotation: SharedValue<number>;
  edgeLength: SharedValue<number>;
};

export type EdgeLabelRendererFunction<E> = (
  props: EdgeLabelRendererProps<E>
) => JSX.Element | null;
