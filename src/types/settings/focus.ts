import { Alignment, AnimatedVectorCoordinates } from '@/types/layout';

import { AnimationSettings, AnimationSettingsWithDefaults } from './animations';

export type FocusSettings = {
  alignment?: Alignment;
  animation?: AnimationSettings | null;
  vertexScale?: number;
};

export type FocusedVertexData = {
  animation: AnimationSettingsWithDefaults;
  vertex?: {
    alignment: Required<Alignment>;
    position: AnimatedVectorCoordinates;
    radius: number;
    scale: number;
  };
};
