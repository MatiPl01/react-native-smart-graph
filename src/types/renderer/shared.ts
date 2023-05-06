import { SharedValue } from 'react-native-reanimated';

import { AnimatedVector, AnimatedVectorCoordinates } from '../layout';

export type VertexRendererProps<V> = {
  key: string;
  data: V;
  radius: number;
  position: AnimatedVectorCoordinates;
};

export type VertexRenderFunction<V> = (
  props: VertexRendererProps<V>
) => JSX.Element | null;

export type EdgeLabelRendererProps<E> = {
  key: string;
  data: E;
  vertexRadius: number;
  edgeCenterPosition: AnimatedVector;
  edgeRotation: SharedValue<number>;
  edgeLength: SharedValue<number>;
};

export type EdgeLabelRendererFunction<E> = (
  props: EdgeLabelRendererProps<E>
) => JSX.Element | null;
