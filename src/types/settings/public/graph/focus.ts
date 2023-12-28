import { SharedValue } from 'react-native-reanimated';

import { Alignment } from '@/types/layout';
import { Animatable, DeepRequired, Maybe } from '@/types/utils';

import { AnimationSettings } from './animations';

/*
 * SINGLE VERTEX FOCUS
 */
export type FocusSettings = {
  alignment?: Alignment;
  animation?: Maybe<AnimationSettings>;
  disableGestures?: boolean;
  vertexScale?: number;
};

/*
 * MULTI-STEP VERTEX FOCUS
 */
export type FocusPoint = {
  alignment?: Alignment;
  key: string;
  vertexScale?: number;
};

export type FocusPoints = Record<number, FocusPoint>;

export type UpdatedFocusPoint = {
  point: DeepRequired<FocusPoint>;
  startsAt: number;
};

export type MultiStepFocusSettings = {
  disableGestures?: Animatable<boolean>;
  points: Animatable<FocusPoints>;
  pointsChangeAnimationSettings?: AnimationSettings;
  progress: SharedValue<number>;
};
