import { Vector } from '@shopify/react-native-skia';

import { VertexComponentRenderData } from './components';
import { AnimationSettingsWithDefaults, FocusPoint } from './settings';
import { Maybe } from './utils';

export type FocusData = {
  gesturesDisabled: boolean;
  key: string;
};

export type BlurData = {
  origin: Vector;
};

export type FocusStartFunction = (
  data: FocusData,
  animationSettings: Maybe<AnimationSettingsWithDefaults>
) => void;

export type FocusEndFunction = (
  data?: Maybe<BlurData>,
  animationSettings?: Maybe<AnimationSettingsWithDefaults>
) => void;

export type FocusStepData = {
  startsAt: number;
  value: FocusPoint;
  vertex: VertexComponentRenderData;
};
