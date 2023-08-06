import { AllAnimationSettings } from '@/types/settings';

import EASING from './easings';

export const DEFAULT_ANIMATION_SETTINGS: AllAnimationSettings = {
  duration: 250,
  easing: EASING.easeInOut
};

export const DEFAULT_GESTURE_ANIMATION_SETTINGS: AllAnimationSettings = {
  duration: 150,
  easing: EASING.ease
};

export const DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS: AllAnimationSettings = {
  duration: 250,
  easing: EASING.ease
};

export const DEFAULT_FOCUS_ANIMATION_SETTINGS: AllAnimationSettings = {
  duration: 250,
  easing: EASING.ease
};
