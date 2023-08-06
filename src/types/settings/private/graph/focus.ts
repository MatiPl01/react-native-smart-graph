/* eslint-disable import/no-unused-modules */
import { FocusSettings } from '@/types/settings/public';
import { DeepRequiredAll } from '@/types/utils';

import { AllAnimationSettings } from './animations';

/*
 * SINGLE VERTEX FOCUS
 */
export type AllFocusSettings = DeepRequiredAll<
  Omit<FocusSettings, 'animation'>
> & {
  animation: AllAnimationSettings;
};
