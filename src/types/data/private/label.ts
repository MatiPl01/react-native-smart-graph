import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

export type LabelComponentData<E = void> = {
  animationProgress: SharedValue<number>;
  transform: SharedValue<{
    center: Vector;
    p1: Vector;
    p2: Vector;
    scale: number;
  }>;
  value: E;
};
