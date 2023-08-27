import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { ArrowRenderer } from '@/types/components/public';

export type ArrowComponentProps = {
  animationProgress: SharedValue<number>;
  renderer: ArrowRenderer;
  transform: SharedValue<{
    dirVector: Vector;
    scale: number;
    tipPosition: Vector;
    vertexRadius: number;
  }>;
};
