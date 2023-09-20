import { Transforms2d } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { EdgeArrowRenderer } from '@/types/components/public';

export type EdgeArrowComponentProps = {
  animationProgress: SharedValue<number>;
  renderer: EdgeArrowRenderer;
  transform: SharedValue<Transforms2d>;
  vertexRadius: number;
};
