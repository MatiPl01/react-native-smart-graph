import { Vector } from '@shopify/react-native-skia';

import { VertexComponentData } from './components';
import { AnimationSettingsWithDefaults, FocusPoint } from './settings';
import { Maybe } from './utils';

export type FocusData = {
  customSource?: boolean;
  gesturesDisabled?: boolean;
  key: string;
};

export type BlurData = {
  customSource?: boolean;
  origin?: Vector;
};

export type FocusStartFunction = (
  data: FocusData,
  animationSettings?: Maybe<AnimationSettingsWithDefaults>
) => void;

export type FocusEndFunction = (
  data?: Maybe<BlurData>,
  animationSettings?: Maybe<AnimationSettingsWithDefaults>
) => void;

export type FocusStepData<V, E> = {
  startsAt: number;
  value: FocusPoint;
  vertex: VertexComponentData<V, E>;
};
