import { EasingFunctionFactory } from 'react-native-reanimated';

export type AnimationSettings = {
  duration?: number;
  easing?: EasingFunctionFactory;
};

export type AnimationSettingWithDefaults = Required<AnimationSettings>;
