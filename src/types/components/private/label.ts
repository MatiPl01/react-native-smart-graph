import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';

export type EdgeLabelComponentData<E> = {
  animationProgress: SharedValue<number>;
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  height: SharedValue<number>;
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  value?: E;
};
