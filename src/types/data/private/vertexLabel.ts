import { Transforms2d } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

export type VertexLabelComponentData<V = undefined> = {
  animationProgress: SharedValue<number>;
  transform: SharedValue<Transforms2d>;
  value?: V;
};
