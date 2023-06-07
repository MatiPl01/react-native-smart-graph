import { AnimationSettingWithDefaults } from '@/types/animations';

import EASING from './easings';

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettingWithDefaults = {
  duration: 500,
  easing: EASING.bounce
};
