import { SharedValue } from 'react-native-reanimated';

import { ArrowRenderer } from '@/types/components/public';
import { AnimatedVector } from '@/types/layout';

export type ArrowComponentProps = {
  animationProgress: SharedValue<number>;
  directionVector: AnimatedVector;
  height: SharedValue<number>;
  renderer: ArrowRenderer;
  tipPosition: AnimatedVector;
  width: SharedValue<number>;
};
