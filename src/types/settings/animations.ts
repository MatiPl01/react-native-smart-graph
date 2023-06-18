import { EasingFunctionFactory } from 'react-native-reanimated';

import { DeepRequired } from '@/types/utils';

export type AnimationSettings = {
  duration?: number;
  easing?: EasingFunctionFactory;
  onComplete?: () => void;
};

export type SingleModificationAnimationSettings =
  | {
      component?: AnimationSettings;
      layout?: AnimationSettings;
    }
  | AnimationSettings;

export type BatchModificationAnimationSettings =
  | {
      components?: AnimationSettings;
      layout?: AnimationSettings;
    }
  | {
      edges?: Record<string, AnimationSettings>;
      layout?: AnimationSettings;
      vertices?: Record<string, AnimationSettings>;
    }
  | AnimationSettings;

export type AnimationsSettings = {
  edges: Record<string, AnimationSettings | undefined>;
  layout?: AnimationSettings;
  vertices: Record<string, AnimationSettings | undefined>;
};

export type AnimationSettingsWithDefaults = DeepRequired<
  AnimationSettings,
  ['duration' | 'easing']
>;
