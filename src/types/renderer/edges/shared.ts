import { SharedValue } from 'react-native-reanimated';

import { AnimatedVector } from '@/types/layout';
import { SharedRenderersProps } from '@/types/renderer/shared';

// Edge arrow
export type EdgeArrowRendererProps = SharedRenderersProps & {
  width: SharedValue<number>;
  height: SharedValue<number>;
  tipPosition: AnimatedVector;
  centerPosition: AnimatedVector;
  vertexRadius: SharedValue<number>;
  rotation: SharedValue<number>;
};

export type EdgeArrowRenderFunction = (
  props: EdgeArrowRendererProps
) => JSX.Element | null;
