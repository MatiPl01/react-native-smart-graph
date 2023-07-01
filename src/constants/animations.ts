import { Easing } from 'react-native-reanimated';

import { AnimationSettingsWithDefaults } from '@/types/settings';

import EASING from './easings';

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettingsWithDefaults = {
  duration: 500,
  easing: EASING.bounce
};

export const DEFAULT_FORCES_LAYOUT_ANIMATION_SETTINGS: AnimationSettingsWithDefaults =
  {
    duration: 250,
    easing: Easing.bezier(0.35, 0, 1, 0.15)
  };

export const DEFAULT_GESTURE_ANIMATION_SETTINGS: AnimationSettingsWithDefaults =
  {
    duration: 150,
    easing: EASING.ease
  };

export const DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS: AnimationSettingsWithDefaults =
  {
    duration: 150,
    easing: EASING.ease
  };

export const DEFAULT_FOCUS_ANIMATION_SETTINGS: AnimationSettingsWithDefaults = {
  duration: 250,
  easing: EASING.ease
};
