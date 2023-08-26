/* eslint-disable import/no-unused-modules */
import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { Alignment, AnimatedVectorCoordinates } from '@/types/layout';
import { AllAnimationSettings } from '@/types/settings/private/graph/animations';
import { FocusPoint } from '@/types/settings/public/graph/focus';
import { DeepRequired, Maybe } from '@/types/utils';

export type VertexTransform = {
  points: SharedValue<{
    source: Vector;
    target: Vector;
  }>;
  progress: SharedValue<number>;
};

export type VertexComponentData<V> = {
  animationSettings: AllAnimationSettings | null;
  key: string;
  removed: boolean;
  scale: SharedValue<number>;
  transform: VertexTransform;
  value?: V;
};

export type VertexRemoveHandler = (key: string) => void;

export type FocusedVertexData = {
  animation: AllAnimationSettings | null;
  vertex?: {
    alignment: Required<Alignment>;
    key: string;
    position: AnimatedVectorCoordinates;
    radius: number;
    scale: number;
  };
};

export type FocusData = {
  customSource?: boolean;
  gesturesDisabled?: boolean;
  key: string;
};

export type BlurData = {
  customSource?: boolean;
  origin?: Vector;
};

export type FocusStartHandler = (
  data: FocusData,
  animationSettings?: Maybe<AllAnimationSettings>
) => void;

export type FocusEndHandler = (
  data?: Maybe<BlurData>,
  animationSettings?: Maybe<AllAnimationSettings>
) => void;

export type FocusStepData<V> = {
  point: DeepRequired<FocusPoint>;
  startsAt: number;
  vertex: VertexComponentData<V>;
};
