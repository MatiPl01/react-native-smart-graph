import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { EdgeObserver } from '@/types/models';

export type EdgeLabelComponentData<E = unknown> = {
  addObserver: (observer: EdgeObserver<E>) => void;
  animationProgress: SharedValue<number>;
  removeObserver: (observer: EdgeObserver<E>) => void;
  transform: SharedValue<{
    center: Vector;
    p1: Vector;
    p2: Vector;
    scale: number;
  }>;
  value?: E;
};
