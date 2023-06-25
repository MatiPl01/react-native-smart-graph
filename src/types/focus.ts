import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';

import { AnimationSettingsWithDefaults } from './settings';

export type FocusData = {
  centerPosition: AnimatedVectorCoordinates;
  scale: SharedValue<number>;
};

export type FocusSetter = (
  data: FocusData | null,
  animationSettings: AnimationSettingsWithDefaults | null
) => void;
