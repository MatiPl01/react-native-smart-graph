/* eslint-disable import/no-unused-modules */
import { SharedValue } from 'react-native-reanimated';

import { Alignment } from '@/types/layout';
import { Maybe } from '@/types/utils';

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

export type MultiStepFocusSettings = {
  disableGestures?: boolean;
  points: FocusPoints;
  progress: SharedValue<number>;
};
