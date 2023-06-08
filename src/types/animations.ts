import { EasingFunctionFactory } from 'react-native-reanimated';

export type AnimationSettings = {
  duration?: number;
  easing?: EasingFunctionFactory;
  onComplete?: () => void;
};

export type SingleModificationAnimationSettings =
  | AnimationSettings
  | {
      component?: AnimationSettings;
      layout?: AnimationSettings;
    };

export type BatchModificationAnimationSettings =
  | AnimationSettings
  | {
      components?: AnimationSettings;
      layout?: AnimationSettings;
    }
  | {
      edges?: Record<string, AnimationSettings>;
      vertices?: Record<string, AnimationSettings>;
      layout?: AnimationSettings;
    };

export type AnimationsSettings = {
  layout?: AnimationSettings;
  vertices: Record<string, AnimationSettings | undefined>;
  edges: Record<string, AnimationSettings | undefined>;
};

type AnimationSettingsWithDefaults = Required<AnimationSettings>;

export type AnimationsSettingsWithDefaults = {
  layout: AnimationSettingsWithDefaults;
  vertices: Record<string, AnimationSettingsWithDefaults>;
  edges: Record<string, AnimationSettingsWithDefaults>;
};
