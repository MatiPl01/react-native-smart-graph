/* eslint-disable import/no-unused-modules */
import { FocusSettings } from '@/types/settings/public';
import { DeepRequire } from '@/types/utils';

import { AllAnimationSettings } from './animations';

/*
 * SINGLE VERTEX FOCUS
 */
export type AllFocusSettings = DeepRequire<Omit<FocusSettings, 'animation'>> & {
  animation: AllAnimationSettings | null;
};
