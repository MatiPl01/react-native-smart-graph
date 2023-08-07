/* eslint-disable import/no-unused-modules */
import { EasingFactoryFn, EasingFn } from 'react-native-reanimated';

export type AnimationSettings = {
  duration?: number;
  easing?: AnimationEasing;
  onComplete?: (finished?: boolean) => void;
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

export type GraphAnimationsSettings = {
  edges?: AnimationSettings;
  layout?: AnimationSettings;
  vertices?: AnimationSettings;
};

export type AnimationEasing = EasingFactoryFn | EasingFn;
