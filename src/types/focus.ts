import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';

import { AnimationSettingsWithDefaults } from './settings';

export type FocusData = {
  centerPosition: AnimatedVectorCoordinates;
  gesturesDisabled: boolean;
  scale: SharedValue<number>;
};

export type PanGestureData = {
  isPanning: SharedValue<boolean>;
  position: AnimatedVectorCoordinates;
};

export type FocusStartSetter = (
  data: FocusData,
  animationSettings: AnimationSettingsWithDefaults | null
) => void;

export type FocusEndSetter = (
  data?: PanGestureData,
  animationSettings?: AnimationSettingsWithDefaults | null
) => void;
