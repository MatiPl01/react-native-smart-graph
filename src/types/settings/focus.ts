import { Alignment, AnimatedVectorCoordinates } from '@/types/layout';
import { DeepRequiredAll, Maybe } from '@/types/utils';

import { AnimationSettings, AnimationSettingsWithDefaults } from './animations';

export type FocusSettings = {
  alignment?: Alignment;
  animation?: Maybe<AnimationSettings>;
  disableGestures?: boolean; // defaults to true
  vertexScale?: number;
};

export type FocusSettingsWithDefaults = DeepRequiredAll<
  Omit<FocusSettings, 'animation'>
> & { animation: AnimationSettingsWithDefaults };

export type FocusedVertexData = {
  animation: AnimationSettingsWithDefaults | null;
  vertex?: {
    alignment: Required<Alignment>;
    key: string;
    position: AnimatedVectorCoordinates;
    radius: number;
    scale: number;
  };
};
