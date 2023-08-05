/* eslint-disable import/no-unused-modules */
import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { Alignment, AnimatedVectorCoordinates } from '@/types/layout';
import { Vertex } from '@/types/models/public/vertex';
import { AllAnimationSettings } from '@/types/settings/private/graph/animations';
import { FocusPoint } from '@/types/settings/public/graph/focus';
import { Maybe } from '@/types/utils';

export type VertexComponentData<V, E> = {
  animationSettings: AllAnimationSettings;
  currentRadius: SharedValue<number>;
  displayed: SharedValue<boolean>;
  position: AnimatedVectorCoordinates;
  removed: boolean;
  scale: SharedValue<number>;
  vertex: Vertex<V, E>;
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

export type FocusStartFunction = (
  data: FocusData,
  animationSettings?: Maybe<AllAnimationSettings>
) => void;

export type FocusEndFunction = (
  data?: Maybe<BlurData>,
  animationSettings?: Maybe<AllAnimationSettings>
) => void;

export type FocusStepData<V, E> = {
  startsAt: number;
  value: FocusPoint;
  vertex: VertexComponentData<V, E>;
};
