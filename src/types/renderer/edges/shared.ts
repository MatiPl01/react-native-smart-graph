import { SharedValue } from 'react-native-reanimated';

import { AnimatedVector } from '@/types/layout';

import { SharedRenderersProps } from '../shared';

// Edge arrow
export type EdgeArrowRendererProps = SharedRenderersProps & {
  size: SharedValue<number>;
  vertexPosition: AnimatedVector;
  tipPosition: AnimatedVector;
  centerPosition: AnimatedVector;
  rotation: SharedValue<number>;
};

export type EdgeArrowRenderFunction = (
  props: EdgeArrowRendererProps
) => JSX.Element | null;
