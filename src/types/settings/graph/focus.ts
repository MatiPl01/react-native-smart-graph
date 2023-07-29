import { SharedValue } from 'react-native-reanimated';

import { Alignment } from '@/types/layout';

export type FocusPoint = {
  alignment?: Alignment;
  key: string;
  vertexScale?: number;
};

export type FocusPoints = Record<number, FocusPoint>;

export type MultiStepFocusSettings = {
  gesturesDisabled?: boolean;
  points: FocusPoints;
  progress: SharedValue<number>;
};
