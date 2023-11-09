import { Transforms2d } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { VertexObserver } from '@/types/models';

export type VertexLabelComponentData<V = unknown> = {
  addObserver: (observer: VertexObserver<V>) => void;
  animationProgress: SharedValue<number>;
  focusProgress: SharedValue<number>;
  removeObserver: (observer: VertexObserver<V>) => void;
  transform: SharedValue<Transforms2d>;
  value?: V;
  vertexKey: string;
};
