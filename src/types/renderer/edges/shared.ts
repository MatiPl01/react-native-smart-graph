import { SharedValue } from 'react-native-reanimated';

import { AnimatedVector } from '@/types/layout';
import { SharedRenderersProps } from '@/types/renderer/shared';

// Edge arrow
export type EdgeArrowRendererProps = SharedRenderersProps & {
  centerPosition: AnimatedVector;
  height: SharedValue<number>;
  rotation: SharedValue<number>;
  tipPosition: AnimatedVector;
  vertexRadius: SharedValue<number>;
  width: SharedValue<number>;
};

export type EdgeArrowRenderFunction = (
  props: EdgeArrowRendererProps
) => JSX.Element | null;
