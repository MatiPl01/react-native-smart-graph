// eslint-disable-next-line import/default
import Animated, { EasingFunctionFactory } from 'react-native-reanimated';

export type AnimationSettings = {
  duration?: number;
  easing?: Animated.EasingFunction;
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

export type AnimationSettingsWithDefaults = {
  duration: number;
  // Change this type from Animated.EasingFunction to EasingFunctionFactory
  // because of incorrect type definition in react-native-reanimated
  easing: EasingFunctionFactory;
  onComplete?: () => void;
};
