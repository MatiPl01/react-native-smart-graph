import { Alignment, AnimatedVectorCoordinates } from '@/types/layout';
import { DeepRequired } from '@/types/utils';

import { AnimationSettings, AnimationSettingsWithDefaults } from './animations';

export type FocusSettings = {
  alignment?: Alignment;
  animation?: AnimationSettings | null;
  disableGestures?: boolean; // defaults to true
  vertexScale?: number;
};

export type FocusSettingsWithDefaults = DeepRequired<
  FocusSettings,
  ['disableGestures']
>;

export type FocusedVertexData = {
  animation: AnimationSettingsWithDefaults | null;
  vertex?: {
    alignment: Required<Alignment>;
    position: AnimatedVectorCoordinates;
    radius: number;
    scale: number;
  };
};
