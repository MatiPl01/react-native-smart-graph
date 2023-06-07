import { EasingFunctionFactory } from 'react-native-reanimated';

export type AnimationSettings = {
  duration?: number;
  easing?: EasingFunctionFactory;
  onComplete?: () => void;
};

export type AnimationSettingWithDefaults = Required<AnimationSettings>;
