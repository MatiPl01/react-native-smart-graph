import { SharedValue } from 'react-native-reanimated';

import { LabelRenderer } from '@/types/components/public';
import { AnimatedVectorCoordinates } from '@/types/layout';

export type LabelComponentProps<E> = {
  animationProgress: SharedValue<number>;
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  edgeKey: string;
  height: SharedValue<number>;
  renderer: LabelRenderer<E>;
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  value?: E;
};
