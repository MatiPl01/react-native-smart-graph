import { AnimationSettingsWithDefaults } from '@/types/animations';

import EASING from './easings';

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettingsWithDefaults = {
  duration: 500,
  easing: EASING.bounce
};
