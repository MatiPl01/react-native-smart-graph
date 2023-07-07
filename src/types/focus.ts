import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';

import { AnimationSettingsWithDefaults } from './settings';
import { Maybe } from './utils';

export type FocusData = {
  centerPosition: AnimatedVectorCoordinates;
  gesturesDisabled: boolean;
  key: string;
  scale: SharedValue<number>;
};

export type BlurData = {
  isGestureActive: SharedValue<boolean>;
  origin: Vector;
  translation: AnimatedVectorCoordinates;
};

export type FocusStartSetter = (
  data: FocusData,
  animationSettings: Maybe<AnimationSettingsWithDefaults>
) => void;

export type FocusEndSetter = (
  data?: Maybe<BlurData>,
  animationSettings?: Maybe<AnimationSettingsWithDefaults>
) => void;
