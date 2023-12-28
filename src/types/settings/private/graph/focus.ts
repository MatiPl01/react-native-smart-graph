import { FocusSettings, MultiStepFocusSettings } from '@/types/settings/public';
import { DeepRequired, SharedifyWithout } from '@/types/utils';

import { AllAnimationSettings } from './animations';

/*
 * SINGLE VERTEX FOCUS
 */
export type AllFocusSettings = DeepRequired<
  Omit<FocusSettings, 'animation'>
> & {
  animation: AllAnimationSettings | null;
};

/*
 * MULTI-STEP VERTEX FOCUS
 */
export type AllMultiStepFocusSettings = Omit<
  Required<MultiStepFocusSettings>,
  'pointsChangeAnimationSettings'
> & {
  pointsChangeAnimationSettings: AllAnimationSettings | null;
};

export type InternalMultiStepFocusSettings = SharedifyWithout<
  AllMultiStepFocusSettings,
  'pointsChangeAnimationSettings' | 'progress'
>;
