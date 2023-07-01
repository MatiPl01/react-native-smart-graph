import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';

import { AnimationSettingsWithDefaults } from './settings';
import { Maybe } from './utils';

export type FocusData = {
  centerPosition: AnimatedVectorCoordinates;
  gesturesDisabled: boolean;
  scale: SharedValue<number>;
};

export type BlurData = {
  isPanning: SharedValue<boolean>;
  position: AnimatedVectorCoordinates;
};

export type PanGestureData = {
  isPanning: SharedValue<boolean>;
  position: AnimatedVectorCoordinates;
};

export type FocusStartSetter = (
  data: FocusData,
  animationSettings: Maybe<AnimationSettingsWithDefaults>
) => void;

export type FocusEndSetter = (
  data?: PanGestureData,
  animationSettings?: Maybe<AnimationSettingsWithDefaults>
) => void;
