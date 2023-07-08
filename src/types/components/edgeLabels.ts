import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';
import { EdgeLabelRendererFunction } from '@/types/renderer';

export type EdgeLabelComponentData<E> = {
  animationProgress: SharedValue<number>;
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  height: SharedValue<number>;
  renderer: EdgeLabelRendererFunction<E>;
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  value?: E;
};
